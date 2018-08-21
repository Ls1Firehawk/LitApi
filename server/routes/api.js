var APP_CONFIG = require('../../app_config.js');
var express = require('express')
var router = express.Router();

var jwt = require('jsonwebtoken');
var passport = require('passport');
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;


router.post('/getvenues/',passport.authenticate('jwt', { session: false }), function(req,res) {
  
	googleapi_getvenues(req.body.latitude, req.body.longitude, req.body.radius, function (apiresult) {
    res.setHeader("content-type", "text/javascript")
		res.status(200).json(cleanjson(apiresult))
	})
})

var googleapi_getvenues = function(lat, long,radius,callback){
  var key = APP_CONFIG.google_places_api_key
  var location = lat + "," + long
  var types = "bar";
  //bar, casino, night_club, restaurant

  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + location + "&radius=" + radius + "&types=" + types
  var https = require('https');

  https.get(url, function(response) {
    var body ='';
    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      var places = JSON.parse(body);
      var locations = places.results;
      callback(locations)

    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

var cleanjson = function(rawjson) {
  output = []
  rawjson.forEach((elem)=>{
    output.push({"name": elem.name,  
    "opening_hours": elem.opening_hours,  
    "types" : elem.types,
    "lat" : elem.geometry.location.lat,  
    "lng" : elem.geometry.location.lng,
    "litness" : Math.random() })})
  return output  
  }


module.exports = router;