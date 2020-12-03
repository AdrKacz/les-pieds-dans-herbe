const Reservation = require('../models/reservation');
const async = require('async');
const fetch = require('node-fetch');

// Need to update the API to be more effective
// > Ask only for personal / global
// > Ask only for a given month

// iCal parser
// Create list of reservation from text format to iCAL
function iCALParser(textResponse) {
  // An event is written after BEGIN:VEVENT
  // Ends at DTEND;VALUE=DATE:
  // Starts at DTSTART;VALUE=DATE:
  // ID is UID:
  // And end being written at END:VEVENT
  let isInEvent = false;
  let startDate = null;
  let endDate = null;
  const ical = [];
  textSplitted = textResponse.split('\n');
  textSplitted.forEach(line => {
    if (isInEvent) {
      if (line.startsWith('DTSTART;VALUE=DATE:')) {
        const strDate = line.slice(-8, -4) + '/' + line.slice(-4, -2) + '/' + line.slice(-2);
        startDate = new Date(strDate);
      }
      else if (line.startsWith('DTEND;VALUE=DATE:')) {
        const strDate = line.slice(-8, -4) + '/' + line.slice(-4, -2) + '/' + line.slice(-2);
        endDate = new Date(strDate);

        // End Date is shifted by 1 (to let people leave their location, but we don't care here)
        endDate.setDate(endDate.getDate() - 1);
      };
    };

    if (line.startsWith('BEGIN:VEVENT')) {
      isInEvent = true;
    }
    else if (line.startsWith('END:VEVENT')) {
      // Create reservation if start and end well defined
      if (startDate && endDate) {
        ical.push({
          // need to have the same name as in Reservation object
          date_of_arrival: startDate,
          date_of_departure: endDate,
        });
      };

      // Reset
      isInEvent = false;
      startDate = null;
      endDate = null;
    };
  });
  return ical;
};


// Return JSON object with reservation from database
exports.get_reservations = function(req, res, next) {
  // Check for token session
  var token = req.session.token;

  // Need to make a custom queries to select only conformed and updated in the last hour
  // Can make this directly in the Schema (because it is dependant of it)
  // https://mongoosejs.com/docs/guide.html
  // Done in reservation.js --> query byValidOnes

  // Perform request
  // Need a system of cache to improve performance (only request every X seconds / minutes)
  async.parallel({
    airbnb: function(callback) {
      // Retrieve AirBnb with URL (secret in development and env variable in production)
      var passwords = require('../secrets/passwords'); // [DEV] Use only in development
      var airbnbURL = passwords.airbnb; // [DEV] Use only in development
      // var airbnbURL = process.env.AIRBNB_URI; // [PROD] Use only in production
      fetch(airbnbURL)
        .then(response => response.text())
        .then(text => {
          return iCALParser(text);
        })
        .then(ical => {
          callback(null, ical)
        })
        .catch(error => {
          callback(error, null)
        });
    },
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
    res.json({personal:results.personal, global:results.global.concat(results.airbnb)});
  });
};

// Return iCAL object with reservation from database
exports.get_calendar = function(req, res, next) {

};
