var Reservation = require('../models/reservation');


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
  (req, res, next) => {
    console.log('--- POST REQ ---')
    console.log(req.body);
    res.redirect('/book');
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
