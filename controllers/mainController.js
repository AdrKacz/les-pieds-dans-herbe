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

  body('pack-family').escape().trim(),
  body('pack-trip').escape().trim(),
  body('pack-all').escape().trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors.
      // Need to render the form again, here simply send user to an error page
      return res.status(400).json({errors: errors.array() });
    };

    // Assign pack value
    let pack = 'none';
    if (req.body['pack-family']) {
      pack = 'family';
    } else if (req.body['pack-trip']) {
      pack = 'trip';
    } else if (req.body['pack-all']) {
      pack = 'all';
    };

    // Check if the session already has a token
    let token = req.session.token;
    // If not, create one
    if (!token) {
      token = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
      req.session.token = token;

      // Create reservation
      const reservation = new Reservation({
        date_of_arrival: req.body['date-arrival'],
        date_of_departure: req.body['date-departure'],

        pack: pack,

        session_token: token,
      });
      reservation.save(function(err) {
        if (err) {return next(err);};
        // Successul
        console.log('[DETAILS] New Reservation - ' + token);
        res.redirect('/book');
      });


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
        console.log('[DETAILS] Update Successul - ' + token);
        res.redirect('/book');
      });
    };


  },
];

// Display second step reservation page
exports.book_get = function(req, res, next) {
  res.render('book', {title: 'Confirmation'});
};

// Handle post on the second reservation page
// --> Update reservation assigned
// --> Hanlde payment
exports.book_post = [
  // Validate request
  body('date-arrival').isISO8601().isAfter().toDate(),
  body('date-departure').isISO8601().isAfter().toDate(),

  body('pack-family').escape().trim(),
  body('pack-trip').escape().trim(),
  body('pack-all').escape().trim(),

  body('first-name').escape().trim(),
  body('last-name').escape().trim(),

  body('email').escape().trim(),

  body('address').escape().trim(),

  body('zip').escape().trim(),
  body('city').escape().trim(),
  body('country').escape().trim(),

  body('cc-name').escape().trim(),
  body('cc-number').escape().trim(),
  body('cc-expiration').escape().trim(),
  body('cc-cvv').escape().trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors.
      // Need to render the form again, here simply send user to an error page
      return res.status(400).json({errors: errors.array() });
    };

    // Assign pack value
    let pack = 'none';
    if (req.body['pack-family']) {
      pack = 'family';
    } else if (req.body['pack-trip']) {
      pack = 'trip';
    } else if (req.body['pack-all']) {
      pack = 'all';
    };

    // Reservation object create/update
    const objectReservation = {
      name: req.body['first-name'],
      surname: req.body['last-name'],
      email: req.body['email'],

      address: req.body['address'],
      zip: req.body['zip'],
      city: req.body['city'].toUpperCase(),
      country: req.body['country'].toUpperCase(),

      // Person to implement
      // Baby to implement

      date_of_arrival: req.body['date-arrival'],
      date_of_departure: req.body['date-departure'],

      pack: pack,
    };

    // Check if the session already has a token
    let token = req.session.token;
    // If not, create one
    if (!token) {
      token = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
      req.session.token = token;

      // Update token and create reservation
      objectReservation.session_token = token;
      const reservation = new Reservation(objectReservation);
      reservation.save(function(err) {
        if (err) {return next(err);};
        // Successul
        console.log('[BOOK] Creation Successful - ' + token);
        res.redirect('/pay');
      });

    } else {
      // Retrieve reservation and update it
      Reservation.findOneAndUpdate(
        {'session_token': token},
        objectReservation,
        {},
        function(err, _) {
        if (err) {return next(err);};
        // Successful - redirect to book page
        console.log('[BOOK] Update Successful - ' + token);
        res.redirect('/pay');
      });
    };
  },
];

// Display last step reservation page, proceed to payment with Stripe API
exports.pay = function(req, res, next) {
  res.render('pay', {title: 'Paiement'});
};
