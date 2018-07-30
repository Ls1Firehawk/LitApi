var express = require('express');
var app = express();
var server = require('http').Server(app);
var fs = require("fs");

/*app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/fonts',express.static(__dirname + '/fonts'));
app.use('/build',express.static(__dirname+ '/build'));
*/

app.use('/',express.static(__dirname + '/'));


app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

server.listen(process.env.PORT || 8081,function(){
  console.log('Listening on '+server.address().port);
  
});


