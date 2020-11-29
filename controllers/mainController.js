var Reservation = require('../models/reservation');

// Require to validate form
const {body, validationResult} = require('express-validator');


// Display HOME page
exports.home = function(req, res, next) {
  res.render('home', {title: 'Les pieds dans l\'herbe'});
};

// Display first step reservation page
exports.details_get = function(req, res, next) {
  res.render('details', {title: 'Réservation'});
};

// Handle post on the first reservation page --> Creation of a reservation in the database
exports.details_post = [
  // Validate request
  body('date-arrival').isISO8601().isAfter().toDate(),
  body('date-departure').isISO8601().isAfter().toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors.
      // Need to render the form again, here simply send user to an error page
      return res.status(400).json({errors: errors.array() });
    };

    // Assign pack value
    console.log(req.body)
    var pack = 'none';
    if (req.body['pack-family']) {
      pack = 'family';
    } else if (req.body['pack-trip']) {
      pack = 'trip';
    } else if (req.body['pack-all']) {
      pack = 'all';
    };

    // Check if the session already has a token
    var token = req.session.token;
    // If not, create one
    if (!token) {
      token = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
      req.session.token = token;

      // Create reservation
      var reservation = new Reservation({
        date_of_arrival: req.body['date-arrival'],
        date_of_departure: req.body['date-departure'],

        pack: pack,

        session_token: token,
      });
      reservation.save(function(err) {
        if (err) {return next(err);};
        // Successul
        console.log('Creation Successul');
        res.redirect('/book');
      })
      console.log('New Reservation: ' + reservation);

    } else {
      // Retrieve reservation and update it
      Reservation.findOneAndUpdate(
        {'session_token': token},
        {
          date_of_arrival: req.body['date-arrival'],
          date_of_departure: req.body['date-departure'],
          pack: pack,
        },
        {},
        function(err, _) {
        if (err) {return next(err);};
        // Successful - redirect to book page
        console.log('Update Successul');
        res.redirect('/book');
      });
    };


  }
];

// Display second step reservation page
exports.book_get = function(req, res, next) {
  res.render('book', {title: 'Confirmation'});
};

// Handle post on the second reservation page
// --> Update reservation assigned
// --> Hanlde payment
exports.book_post = function(req, res, next) {
  res.render('book', {title: 'BOOK PAGE POST - NOT IMPLEMENTED', errors: null});
};
