const Reservation = require('../models/reservation');
const async = require('async');

// Import Strip to handle payment
const passwords = require('../secrets/passwords');
const stripe = require('stripe')(passwords.stripe);

// Import price
const prices = require('../secrets/prices-rules');

function calculateReservationAmount(reservation) {
  // Return price in cents (need to multiply by 100)

  // Iterates throught the day booked to set the price (in order to set specific rules)
  const arrivalDate = new Date(reservation.date_of_arrival);
  const departureDate = new Date(reservation.date_of_departure);

  const currentDate = new Date(reservation.date_of_arrival);

  let amount = 0;
  while (currentDate < departureDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDay();
    const date = currentDate.getDate();


    // Look top to bottom priority
    // Get the base price [=], stop looking for after first found
    // Get operation [+ or -] (all of them)
    let base = null;
    let operation = 0;

    if (prices.date[date]) {
      const label = prices.date[date];

      if (label[0] === '+' || label[0] === '-') {
        // Operation
        operation += parseFloat(label);
      } else if (!base) {
        // Base (assign only if not assigned yet)
        base = parseFloat(label);
      };
    };

    if (prices.day[day]) {
      const label = prices.day[day];

      if (label[0] === '+' || label[0] === '-') {
        // Operation
        operation += parseFloat(label);
      } else if (!base) {
        // Base (assign only if not assigned yet)
        base = parseFloat(label);
      };
    };

    if (prices.month[month]) {
      const label = prices.month[month];

      if (label[0] === '+' || label[0] === '-') {
        // Operation
        operation += parseFloat(label);
      } else if (!base) {
        // Base (assign only if not assigned yet)
        base = parseFloat(label);
      };
    };

    if (prices.year[year]) {
      const label = prices.year[year];

      if (label[0] === '+' || label[0] === '-') {
        // Operation
        operation += parseFloat(label);
      } else if (!base) {
        // Base (assign only if not assigned yet)
        base = parseFloat(label);
      };
    };

    // Set general as base if not already set
    if (!base) {
      base = parseFloat(prices.general);
    };
    // Update the total amount
    amount += (base + operation);
    // Go to next day
    currentDate.setDate(currentDate.getDate() + 1);
  };

  return amount * 100; // convert into cents
};

exports.create_payment_intent = function(req, res, next) {
  // Get user reservation to set price
  // Check for token session
  const token = req.session.token;
  let reservationPersonal = null;
  let amountReservation = null;

  async.series({
    personal: function(callback) {
      // Get reservation and store
      if (!token) {
        throw new Error('No Session Created');
      };
      Reservation.findOne({'session_token': token}, '-_id date_of_arrival date_of_departure').byValidOnes().byPayableOnes()
        .exec((err, personal) => {
          reservationPersonal = personal;
          callback(err, personal);
        });
    },
    amount: function(callback) {
      // Calculate price
      amountReservation = calculateReservationAmount(reservationPersonal);
      callback(null, amountReservation);
    },
    clientSecret: function(callback) {
      if (!amountReservation) {
        throw new Error('No amount to assign');
      };

      // Create a PaymentIntent with the order amount and currency
      stripe.paymentIntents.create({
        amount: amountReservation,
        currency: 'eur',
      })
      .then(paymentIntent => {
        callback(null, paymentIntent.client_secret)
      })
      .catch(error => {
        callback(error, null)
      });
    },
  }, function(err, results) {
    if (err) {return next(err)};
    // Successful, send secret to client
    console.log('Create Payment ID: ' + results.clientSecret)
    res.json({clientSecret: results.clientSecret});
  });
};

exports.get_price = function(req, res, next) {
  // Get user reservation to set price
  // Check for token session
  const token = req.session.token;
  let reservationPersonal = null;

  async.series({
    personal: function(callback) {
      if (!token) {
        throw new Error('No Session Created');
      };
      // Get reservation and store
      Reservation.findOne({'session_token': token}, '-_id date_of_arrival date_of_departure').byValidOnes().byPayableOnes()
        .exec((err, personal) => {
          reservationPersonal = personal;
          callback(err, personal);
        });
    },
    amount: function(callback) {
      // Calculate price
      callback(null, calculateReservationAmount(reservationPersonal));
    },
  }, function(err, results) {
    if (err) {return next(err)};
    // Successful, send secret to client
    res.json({amount: results.amount});
  });
};

exports.get_price_information = function(req, res, next) {
  // Check if the request is as expected
  // Check for correct attributes in it
  if (!req.body.date_of_arrival || !req.body.date_of_departure || !req.body.pack) {
    return next(new Error('Reservation not correctly formatted'));
  };
  res.json({amount: calculateReservationAmount(req.body)});
};

exports.validate_payment = function(req, res, next) {
  // Check if ID exist in Stripe Database (need real stripe connection)
  // Be notify with webhook --> Need to rebuilt the payment system to work with webhook
  // https://stripe.com/docs/webhooks
  // https://stripe.com/docs/payments/accept-a-payment-synchronously
  // https://stripe.com/docs/payments/payment-intents/verifying-status (client side)
  console.log('Validate Paiement: ' + req.body.paymentIntentId);
  // Send information that the ID was validated
  res.json({was_validated: true});
};
