var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Express = require('express');
var expressValidator = require('express-validator');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var session = require('express-session');


//localhost:8081/api/getvenues/45.428087&-75.722224&1500&0

var auth_route = require('./routes/auth.js');
var api_route = require('./routes/api.js');

const app = new Express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(session({
  secret: 'supersecret',
  saveUninitialized: true,
  resave: true
}))

app.get('*', function(req, res){
  let status = 200
  return res.status(status).send("Basic home page")
});

app.use('/auth', auth_route);
app.use('/api', api_route);

app.listen(8081, function(){
  console.log("Listening on 8081");
});


