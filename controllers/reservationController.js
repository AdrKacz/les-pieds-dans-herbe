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

        // Not needed, down client side
        // End Date is shifted by 1 (to let people leave their location, but we don't care here) --> As date_of_departure_used
        // endDate.setDate(endDate.getDate() - 1);
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

// iCal creator
// Create iCal from list of reservation
function iCALCreate(reservations) {
  // Check if there is reservation to send, return nothing if not
  if (reservations.length === 0) {
    return '';
  };

  // Global definition of the iCAL (look at the definiton of PRODID mainly !)
  let iCALText = 'BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//Les Pieds Dans Herbe Inc//Hosting Calendar//FR\n';

  for (let i = 0; i < reservations.length; i++) {
    iCALText += 'BEGIN:VEVENT\n';

    // Add end date
    iCALText += 'DTEND;VALUE=DATE:' + reservations[i].date_of_departure_iCAL + '\n';

    // Add start date
    iCALText += 'DTSTART;VALUE=DATE:' + reservations[i].date_of_arrival_iCAL + '\n';

    // Add UID
    iCALText += 'UID:' + reservations[i].session_token + '@lespiedsdansherbe\n';

    // Check reserved
    iCALText += 'SUMMARY:Reserved\n'

    iCALText += 'END:VEVENT\n';
  };

  iCALText += 'END:VCALENDAR\n';
  return iCALText;
};


// Return JSON object with reservation from database
exports.get_reservations = function(req, res, next) {
  // Check for token session
  const token = req.session.token;
  console.log('Get reservation > ' + token)

  // Need to make a custom queries to select only conformed and updated in the last hour
  // Can make this directly in the Schema (because it is dependant of it)
  // https://mongoosejs.com/docs/guide.html
  // Done in reservation.js --> query byValidOnes

  // Perform request
  // Need a system of cache to improve performance (only request every X seconds / minutes)
  async.parallel({
    airbnb: function(callback) {
      // Retrieve AirBnb with URL (secret in development and env variable in production)
      // var passwords = require('../secrets/passwords'); // [DEV] Use only in development
      // var airbnbURL = passwords.airbnb; // [DEV] Use only in development
      var airbnbURL = process.env.AIRBNB_URI; // [PROD] Use only in production
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
    // Successful, so send the data
    res.json({personal:results.personal, global:results.global.concat(results.airbnb)});
  });
};

// Return valid resertion of the user already filled and not payed yet
exports.get_full_reservation = function(req, res, next) {
  // Check for token session
  const token = req.session.token;

  // Perform request
  async.parallel({
    personal: function(callback) {
      Reservation.findOne({'session_token': token}, '-_id').byValidOnes().byPayableOnes()
        .exec(callback);
    },
  }, function(err, results) {
    if (err) {return next(err)};
    // Successful, so send the data
    res.json({personal:results.personal});
  });
};

// Return iCAL object with reservation from database
exports.get_calendar = function(req, res, next) {
  // Perform request
  async.parallel({
    global: function(callback) {
      Reservation.find({}, '-_id date_of_arrival date_of_departure date_of_arrival_iCAL date_of_departure_iCAL session_token').byValidOnes()
        .exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err)};
    // Successful, so convert to ics and send
    res.set('Content-Type', 'text/calendar');
    res.send(iCALCreate(results.global));
  });
};
