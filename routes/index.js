const express = require('express');
const router = express.Router();

const mainController = require('../controllers/mainController');
const reservationController = require('../controllers/reservationController');
const paymentController = require('../controllers/paymentController');

/// MAIN ROUTES ///

// REDIRECT To Home Page
router.get('/', function(req, res) {
  res.redirect('/home');
});

// GET Home Page
router.get('/home', mainController.home);

// GET Details Page
router.get('/details', mainController.details_get);

// POST Details Page
router.post('/details', mainController.details_post);

// GET Book Page
router.get('/book', mainController.book_get);

// POST Book Page
router.post('/book', mainController.book_post);

// Get Pay Page (No POST, made internally with fetch and Stripe)
router.get('/pay', mainController.pay);

// Route to private link to retreive information
router.get('/reservations/get-reservations', reservationController.get_reservations);

router.get('/reservations/get-full-reservation', reservationController.get_full_reservation);

router.get('/reservations/get-calendar.ics', reservationController.get_calendar);

// Route to handle payment
router.post('/payment/create-payment-intent', paymentController.create_payment_intent);

module.exports = router;
