var APP_CONFIG = require('../app-config.js');
var request = require('superagent');

//Middleware
var jwt = require('jsonwebtoken');
var passport = require('passport');
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-local').Strategy;

var google = require('googleapis');
//var googlePlus = google.plus('v1');
//var OAuth2 = google.auth.OAuth2;
/*var googleAuth = new OAuth2(
  APP_CONFIG.googleConfig.appID,
  APP_CONFIG.googleConfig.appSecret,
  APP_CONFIG.googleConfig.callbackUrl
);
*/

//Serialize/deserialize
//Seriale user takes in a user object and passes the id to the callback function 'done'
passport.serializeUser(function(user,done){

  done(null, user.id);
});

//Given a user id, we search the database for the user and pass it to the callback function done
passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err, user){
    done(err, user);
  });
});

//JWT Strategy is used to verify a client's JWT before accessing a 'secret' route
//passport.use('jwt', new JwtStrategy());

//THe following are strategies for logging in, all of which respond to the client with a JWT if succesful
//passport.use('local',new LocalStrategy());

var facebookAuth = function(socialtoken, done) {};

var googleAuth = function(socialtoken, done) {};
  

//Routes
var express = require('express');
var router = express.Router();


router.post('/login/local', function(req, res) {
  res.send("login/local");
});

router.post('/login/facebook', function(req, res) {
  res.send("/login/facebook");
});

router.post('/login/google', function(req, res) {
  res.send("/login/google");
});
  
router.post('/register/local', function (req, res) {
  res.send("/register/local");
});

module.exports = router;