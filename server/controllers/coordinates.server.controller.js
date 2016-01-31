var config = require('../config/config'), 
    request = require('request');

module.exports = function(req, res, next) {
  if(req.body.address) {
    var options = {
      key: config.googleMaps.key, 
      address: req.body.address
    }
    request({
      url: 'https://maps.googleapis.com/maps/api/geocode/json', 
      qs: options
      }, function(error, response, body) {
        if(error) {
          res.status(400).send(err);
        } 

        var data = JSON.parse(body);
		
		//handle empty responses
		if(!data.results.length || !data.results[0].geometry){
			next();
			return;
		}
		req.results = data.results[0].geometry.location;
        next();
    });
  } else {
    next();
  }
};  