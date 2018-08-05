module.exports = function(app) {
	var Controller = require('./Controller.js');
	
	app.route('/getvenues/:x&:y&:radius&:other')
		.get(Controller.get_venues)
}