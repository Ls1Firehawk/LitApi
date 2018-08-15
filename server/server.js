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

// Connect to the db
mongoose.connect("mongodb://localhost:27017/authtest")
var db = mongoose.connection;


const app = new Express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());


app.use('/auth', auth_route);
app.use('/api', api_route);
app.use('/test/register', function(req,res){
	res.send("<form action='/auth/local/register' method='post'>" +
		"<input type='text' name='email' value='jonannana@email.com'>" +
		"<input type='text' name='username' value='usertest'>" +
		"<input type='password' name='password' value='passwordtest'>" +
		"<input type='password' name='confirmPassword' value='passwordtest'>" +
		"<input type='submit' value='submit'>" +
		"</form>");
})
app.use('/test/login', function(req,res){
	res.send("<form action='/auth/local/login' method='post'>" +
		"<input type='text' name='username' value='usertest1'>" +
		"<input type='password' name='password' value='passwordtest'>" +
		"<input type='submit' value='submit'>"
		)
});

app.listen(8081, function(){
  console.log("Listening on 8081");
});


module.exports = app;
