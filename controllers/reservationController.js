var Reservation = require('../models/reservation');
var async = require('async');

// Need to update the API to be more effective
// > Ask only for personal / global
// > Ask only for a given month


// Return JSON object with reservation from database
exports.get_reservations = function(req, res, next) {
  // Check for token session
  var token = req.session.token;

  // Need to make a custom queries to select only conformed and updated in the last hour
  // Can make this directly in the Schema (because it is dependant of it)
  // https://mongoosejs.com/docs/guide.html
  // Done in reservation.js --> query byValidOnes

  // Perform request
  async.parallel({
    personal: function(callback) {
      Reservation.findOne({'session_token': token}, '-_id date_of_arrival date_of_departure pack').byValidOnes()
        .exec(callback);
    },
    global: function(callback) {
      Reservation.find({'session_token': {$ne: token}}, '-_id date_of_arrival date_of_departure pack').byValidOnes()
        .exec(callback);
    },
  }, function(err, results) {
    if (err) {return next(err)};
    // Successul, so send the data
    res.json({personal:results.personal, global:results.global});
  });
};

// Return iCAL object with reservation from database
exports.get_calendar = function(req, res, next) {

};
