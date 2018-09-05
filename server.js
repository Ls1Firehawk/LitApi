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
var path = require("path");

// Retrieve

// Connect to the db
mongoose.connect("mongodb://localhost:27017/authtest")
var db = mongoose.connection;
//
//

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
		"<input type='text' name='email' value='jon@email.com'>" +
		"<input type='text' name='username' value='jo'>" +
		"<input type='password' name='password' value='passwordtest'>" +
		"<input type='password' name='confirmPassword' value='passwordtest'>" +
		"<input type='submit' value='submit'>" +
		"</form>");
})


app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+"/test/testmenu.html"))
}) 


app.get('/google/success', function(req,res){
	res.sendFile(path.join(__dirname+"/test/storeSuccessGoogle.html"))
})

app.get('/facebook/success', function(req, res) {
  res.sendFile(path.join(__dirname+"/test/storeSuccessFacebook.html"))
})

app.use('/test/login', function(req,res){
	res.sendFile(path.join(__dirname+"/test/login.html"));
	/*res.send("<form action='/auth/local/login' method='post'>" +
		"<input type='text' name='username' value='jo'>" +
		"<input type='password' name='password' value='passwordtest'>" +
		"<input type='submit' value='submit'>"
		);*/
});
app.use('/test/facebook', function(req,res){
	res.sendFile(path.join(__dirname+"/test/facebook.html"));
});
app.use('/test/api', function(req,res) {
	res.sendFile(path.join(__dirname+"/test/callapi.html"));
});
app.use('/test/google', function(req,res){
	res.send('<a href="/auth/login/google">Sign In with Google</a>')
})

app.listen(8081, function(){
  console.log("Listening on 8081");
});


module.exports = app;
