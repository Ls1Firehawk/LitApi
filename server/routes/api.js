var express = require('express')
var router = express.Router();

router.get('/getvenues/:x&:y&:radius&:other', function(req,res) {
	googleapi_getvenues(req.params.x, req.params.y, req.params.radius, req.params.other, function (apiresult) {
		res.status(200).json(cleanjson(apiresult))
	})
})

var googleapi_getvenues = function(x, y, radius, other,callback){
  var key = ""
  var location = x + "," + y
  var types = "bar";
  //bar, casino, night_club, restaurant

  var https = require('https');
  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + location + "&radius=" + radius + "&types=" + types
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