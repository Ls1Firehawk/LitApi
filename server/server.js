var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Express = require('express');
var mongo = require('mongodb');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var auth_route = require('./routes/auth');
var api_route = require('./routes/api');

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/authtest", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});

const app = new Express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());


app.use('/auth', auth_route);
app.use('/api', api_route);
app.use('*', function(req,res){
	res.send("<form action='/auth/local/register' method='post'>" +
		"<input type='text' name='email' value='jonannana@email.com'>" +
		"<input type='text' name='username' value='usertest'>" +
		"<input type='password' name='password' value='passwordtest'>" +
		"<input type='password' name='confirmPassword' value='passwordtest'>" +
		"<input type='submit' value='submit'>" +
		"</form>");
})

app.listen(8081, function(){
  console.log("Listening on 8081");
});


module.exports = app;
