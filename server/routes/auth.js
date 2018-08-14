var express = require('express');
var request = require('superagent');
var passport = require('passport');

var jwt = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var User = require('../models/user.js');
const { check, validationResult } = require('express-validator/check');



passport.serializeUser(function(user,done){
  done(null, user.id);
});
//Given a user id, we search the database for the user and pass it to the callback function done
passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err, user){
    done(err, user);
  });
});

passport.use('local',new LocalStrategy(
  function(username, password, done) {
    
    //Here, we create our own custom local strategy
    //We use custom functions from our User mongoose object to talk to the database
    //The process of our local strategy consists of
      //1. Verifying user exists
      //2. Check if password matches
    
    User.getUserByLocalUsername(username, function(err, user){
      if(err){
        console.log("Throwing error");
        throw err;
      }
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }

      User.comparePassword(password, user.local.password, function(err, isMatch){ //The callback function will be executed after the Mongo query
        if(err){
          console.log("Throwing error");
          throw err;
        }
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'})
        }
      });
    });
}));


router.post('/login/local', function(req, res) {
  passport.authenticate('local', function(err, user, info){
    if (err) {
      console.log(err);
      return res.status(403).json({message: err});
    }
    if (!user) { 
      return res.status(401).json(info);
    }
    req.logIn(user, function(err) {
      if (err) {
        console.log(err);
        return res.status(403).json({message: err});
      }
      var payload = {id: user._id};
      var token = jwt.sign(payload, APP_CONFIG.jwtSecret);  
      return res.status(200).json({message: 'Auth successful', token: token});
    });
    })(req, res);
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
	req.checkBody("confirmPassword", "passwords must mactch").equals(password);

	var errors = req.validationErrors();
	
	if(errors) {
		return res.status(403).json({
			message: "Error with validating data submitted",
			errors: errors
		})
	} else {
		var new_user = new User();
		new_user.username = username;
		new_user.email = email;
		new_user.reg_source = "local";
		new_user.local.password = password;
		try {
			User.createLocalUser(new_user, function(err,user) {
				if(err)
					throw err;
				console.log("User write was succesfull");
				console.log(user);
			});
		} catch (err) {
      console.log(err);
      res.status(409).json({
        message: 'Error with registration process, internal.'
      })
    }
    
    return res.status(200).json({
      message: 'Succesfull registration'
    })
  }
});


module.exports = router;