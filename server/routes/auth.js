var express = require('express');
var request = require('superagent');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;
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


router.post('/local/login', function (req,res) {
  passport.authenticate('local', function(err, user, info){
  
    if(err) {
      console.log(err);
      return res.status(403).json({message: err});
    }
    if(!user)
      return res.status(401).json(info);
    req.logIn(user, function(err) {
      if (err) {
        console.log(err);
        return res.status(403).json({message: err});
        }
        //implement token here (jwt)
        console.log("LOGGED IN!!! YEHAAA")
        res.redirect("/test/login")
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
		try {
			User.createLocalUser(new_user, function(err,user) {
				if(err)
					throw err;
			});
		} catch (err) {
      console.log(err);
      res.status(409).json({
        message: 'Error with registration process, internal.'
      })
    }
    console.log(new_user);
    return res.status(200).json({
      message: 'Succesfull registration'
    })
  }
});


module.exports = router;