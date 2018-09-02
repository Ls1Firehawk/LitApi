var APP_CONFIG = require('../app_config.js');
var express = require('express');
var request = require('superagent');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require("passport-jwt").Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var router = express.Router();
var User = require('../models/user');
const { check, validationResult } = require('express-validator/check');



passport.serializeUser(function(user,done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err, user){
    done(err, user);
  });
});

function extractProfile (profile) {
  let imageUrl = '';
  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
  }
  return {
    id: profile.id,
    displayName: profile.displayName,
    image: imageUrl
  };
}


passport.use('jwt', new JwtStrategy(
{
  jwtFromRequest  : ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  secretOrKey     : APP_CONFIG.jwtSecret
},
function(jwt_payload, done){
  User.getUserById(jwt_payload.id, function(error, user){
    console.log("USER = " + JSON.stringify(user));

    if(error){
      console.log("error: " + error);
      return done(error, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done("You are not authorized", false);
    }  
  });

}
));

passport.use('local',new LocalStrategy(
  function(username, password, done) {
    User.getUserByLocalUsername(username, function(err,userfound){
      if(err)
        throw err;
      if(userfound == null) {
       return done(null, false, {message: "user does not exist"});
     }
     User.comparePassword(password, userfound.local.password, function(err, matchTrue){
      if(err){
        console.log("Throwing error");
        throw err;
      }
      if(matchTrue){
        return done(null, userfound);
      } else {
        return done(null, false, {message: 'Error password'})
      }
    });
   });
  }));

passport.use(new GoogleStrategy({
  clientID: APP_CONFIG.google_client_id,
  clientSecret: APP_CONFIG.google_client_secret,
  callbackURL: APP_CONFIG.google_callback,
  accessType: 'offline'
}, (accessToken, refreshToken, profile, done) => {
      User.getUserByGoogleId( profile.id, function (err, user) {
      if(err) {
        console.log("error: " + error);
        return done(error, false);
      }
    if(user){
      console.log("saved id : " + user._id)
      return done(null, user);
    } else {
      var new_user = new User();
      new_user.google.id = profile.id,
      new_user.email = profile.emails[0].value
      new_user.reg_source = "google"
      new_user.google.token = accessToken,

      User.createGoogleUser(new_user, function(err, user){
        if(err)
          throw err
        else
          return done(err, user);
      })    
    };
  })
}))

router.get('/login/google',
  (req, res, next) => {
    if (req.query.return) {
      req.session.oauth2return = req.query.return;
    }
    next();
  },
  passport.authenticate('google', { scope: ['email', 'profile'] })
  );

router.get('/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    delete req.session.oauth2return;
    console.log(req.user._id)
    var payload = {id: req.user._id};
    var token = jwt.sign(payload, APP_CONFIG.jwtSecret, {expiresIn: '300s'});
    
    res.redirect('/google/success/?jwttoken=' + encodeURIComponent(token));
  }
  );

passport.use(new FacebookStrategy({
  clientID: APP_CONFIG.facebook_id,
  clientSecret: APP_CONFIG.facebook_pass,
  callbackURL: "http://localhost:8081/auth/facebook/callback"
}, function(accessToken, refreshToken, profile, done) {
  console.log("profile id : " + profile.id)
  User.getUserByFacebookId( profile.id, function (err, user) {
    console.log("saved id : " + user._id)
    if(err) {
      console.log("error: " + error);
      return done(error, false);
    }
    if(user){
      return done(null, user);
    } else {
      var new_user = new User();

      new_user.facebook.id = profile.id,
      new_user.facebook.token = accessToken,
      new_user.facebook.name = profile.displayName,
      new_user.email = profile.emails[0].value

      User.createFacebookUser(new_user, function(err, user){
        if(err)
          throw err
        else
          return done(err, user);
      })    
    };
  })
}))

router.get('/login/facebook', passport.authenticate('facebook', { 
  scope : ['public_profile', 'email']
}));

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/no' }),
  function(req, res) {
    //got the user id here
    //https://stackoverflow.com/questions/19035373/how-do-i-redirect-in-expressjs-while-passing-some-context
    var payload = {id: req.user._id};
    var token = jwt.sign(payload, APP_CONFIG.jwtSecret, {expiresIn: '300s'});  
      //return res.status(200).json({message: 'User has been authorized', token: token});
      console.log(encodeURIComponent(token))
      res.redirect('/facebook/success/?jwttoken=' + encodeURIComponent(token));
    });

router.post('/local/login', function (req,res) {
  passport.authenticate('local', function(err, user, info){

    if(err) {
      console.log(err);
      return res.status(403).json({message: err});
    }
    if(!user)
      return res.status(401).json(info);
    //if err here, put logIn instead of login
    req.login(user, function(err) {
      if (err) {
        console.log(err);
        return res.status(403).json({message: err});
      }
      var payload = {id: user._id};
      var token = jwt.sign(payload, APP_CONFIG.jwtSecret, {expiresIn: '300s'});  
      return res.status(200).json({message: 'User has been authorized', token: token});
    });
  })(req,res);

});

router.post("/local/register/",function(req,res) {

  var username = req.body.username
  var email = req.body.email;
  var password = req.body.password;
  var confirmPassword = req.body.confirmPassword;

  req.checkBody("username", "username is empty").notEmpty();
  req.checkBody("email", "email is empty").notEmpty();
  req.checkBody("password", "password is empty").notEmpty();
  req.checkBody("confirmPassword", "confirmPassword is empty").notEmpty();
  req.checkBody("email", "not email format").isEmail();
  req.checkBody("confirmPassword", "passwords must match").equals(password);
  var errors = req.validationErrors();
  
  if(errors) {
    return res.status(403).json({
      message: "Error with validating data submitted",
      errors: errors
    })
  } else {
    var new_user = new User();
    new_user.local.username = username;
    new_user.email = email;
    new_user.reg_source = "local";
    new_user.local.password = password;
    
    User.getUserByEmail(email, function(err, email_user) {
      User.getUserByLocalUsername(username, function(err, name_user){
        console.log(name_user)
        console.log(email_user)
        if(name_user || email_user) {
          return res.status(401).json({message: "username / email already in use"});
        }
        try {
          User.createLocalUser(new_user, function(err,user) {
            if(err)
              throw err;
          });
        } catch (err) {
          console.log(err);
          return res.status(409).json({
            message: 'Error with registration process, internal.'
          });
        }
        
        var payload = {id:new_user._id}
        var token = jwt.sign(payload, APP_CONFIG.jwtSecret);
        res.status(200).json({
          token : token,
          message: 'Succesfull registration'
        }) 
      })      
    })
  }
});



module.exports = router;