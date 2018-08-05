var express = require('express');
var app = express();
var server = require('http').Server(app);
var fs = require("fs");
var bodyParser = require('body-parser')

/*app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/fonts',express.static(__dirname + '/fonts'));
app.use('/build',express.static(__dirname+ '/build'));
*/


app.use('/',express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
var routes = require('./Routes.js')
routes(app)

//Call api
//localhost:8081/getvenues/45.428087&-75.722224&1500&0



server.listen(process.env.PORT || 8081,function(){
  console.log('Listening on '+server.address().port);
  
});


