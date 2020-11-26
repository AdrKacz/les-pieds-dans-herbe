var Reservation = require('../models/reservation');


// Return JSON object with reservation from database
exports.get_reservations = function(req, res, next) {
  Reservation.find({}, '-_id date_of_arrival date_of_departure')
    .exec(function(err, list_reservations) {
      if (err) {return next(err)};
      // Successul, so send the data
      res.json(list_reservations);
    });
};

// Return iCAL object with reservation from database
exports.get_calendar = function(req, res, next) {

};
