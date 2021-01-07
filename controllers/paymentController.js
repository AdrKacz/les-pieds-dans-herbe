const Reservation = require('../models/reservation');
const async = require('async');
const passwords = require('../secrets/passwords'); // [DEV] Use only in development

// To send mail when reservation succeeded
const nodemailer = require('nodemailer');
// Transporter used to send mail
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: passwords.user_mailtrap,
    pass: passwords.pass_mailtrap
  }
});
// Verify if the transporter is correctly et up
transporter.verify(function(err, success) {
  if (err) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

// options for email date formatting
const optionsEmailDateFormatting = {year: 'numeric', month: 'long', day: 'numeric' };

// Import Strip to handle payment
const stripe = require('stripe')(passwords.stripe); // [DEV] only

// ----- During Phase test, use these card
// ----- Payment succeeds
// 4242 4242 4242 4242
//
// ----- Authentication required
// 4000 0025 0000 3155
//
// ----- Payment is declined
// 4000 0000 0000 9995

// const stripe = require('stripe')(process.env.STRIPE_SK); // [PROD] only

// Import price
const prices = require('../prices/prices-rules');

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
      Reservation.findOne({'session_token': token}, '-_id date_of_arrival date_of_departure email').byValidOnes().byPayableOnes()
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
      }, {
        idempotencyKey: reservationPersonal.session_token, // avoid creating many payment intents for the same transaction
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
    console.log('Create Payment ID: ' + results.clientSecret);

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
        callback(new Error('No session to retrieve'), null);
        return;
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

  // Here use retreive Event (can only retreive event of the last 30 days, should be ok)
  // A more clean manner would have been to use webhook
  // Use the Stripe API Retreive Payment Intend instead (to not connect to the Stripe Terminal, so easier)

  // Check out what Stripe means by the necessity of capturing the payment...

  // Get token to retreive personal reservation
  const token = req.session.token;
  let reservationPersonal = null;
  let amountPaid

  async.series([
    function(callback) {
      // Request Stripe API for payment information, throw error if not (function called manualy by the customer --> This should not happen)
      console.log('[1] Request Strip API about payment - ' + req.body.paymentIntentId);
      stripe.paymentIntents.retrieve(req.body.paymentIntentId)
      .then(payment => {
        if (payment.status !== 'succeeded') {
          // Throw error if the payment did not validate
          throw new Error('Payment did not succeed'); // Use later to warn the customer about it
        };
        amountPaid = payment.amount / 100; // cents to euro
        callback(null, payment);
      })
      .catch(err => callback(err, null));
    },
    // By now, the payment succeeded
    function(callback) {
      // Update reservation associated, throw error if no reservation found (this should never happen at this stage)
      // Only update if validated (has already thrown error if not)
      console.log('[2] Update the reservation - ' + token);
      Reservation.findOneAndUpdate(
        {'session_token': token},
        {
          is_validated: true,
          amount_paid: amountPaid,
          validated: new Date(), // Current Date
        },
        {},
        function(err, personal) {
          if (err) {
            callback(new Error('Unable to update the reservation'), null);
            return;
          };
          if (personal===null) {
            callback(new Error('No reservation to update'), null);
            return;
          };
          // Successul -> callback
          reservationPersonal = personal; // Store reservation for mail usage
          callback(null, null);
        }
      )
    },
    function(callback) {
      // Send email to the owner
      console.log('[3] Send Email to the owner');

      const message = {
        from: 'Gite Les Pied Dans l\'Herbe <gitelespieddanslherbe@nodemailer.com>',
        to: 'You <you@nodemailer.com>',
        subject: `A new trip was booked by ${reservationPersonal.name} ${reservationPersonal.surname}`,
        text: `The customer ${token} book a trip for ${amountPaid} € from ${(new Date(reservationPersonal.date_of_arrival)).toLocaleDateString(undefined, optionsEmailDateFormatting)} to ${(new Date(reservationPersonal.date_of_departure)).toLocaleDateString(undefined, optionsEmailDateFormatting)}`
      };

      transporter.sendMail(message, callback);
    },
    function(callback) {
      // Send email to the customer
      console.log('[4] Send Email to the customer');

      const message = {
        from: 'Gite Les Pied Dans l\'Herbe <gitelespieddanslherbe@nodemailer.com>',
        to: `${reservationPersonal.email}`,
        subject: 'You book a trip',
        text: `You book a trip for ${amountPaid} € from ${(new Date(reservationPersonal.date_of_arrival)).toLocaleDateString(undefined, optionsEmailDateFormatting)} to ${(new Date(reservationPersonal.date_of_departure)).toLocaleDateString(undefined, optionsEmailDateFormatting)}`
      };

      transporter.sendMail(message, callback);
    }
  ], function(err, results) {
    if (err) {
      if (err.message === 'Payment did not succeed') {
        // Problem with the payment
        console.error('[NO SUCCESS] Payment not successful, user: ' + token);
        res.json({was_validated: false});

      } else if (err.message === 'Unable to update the reservation') {
        // Problem with the reservation, however payment was successful
        console.error('[ERROR] Payment successful, error while updating the reservation, user: ' + token);
        res.json({was_validated: true});

      } else if (err.message === 'No reservation to update') {
        // Problem with the reservation, however payment was successful
        console.error('[ERROR] Payment successful, no reservation to update');
        res.json({was_validated: true});

      } else {
        console.error(err)
        return next(err);
      };
      return;
    };
    // Successful, inform the customer
    console.log('[SUCCESS] Payment successful, user: ' + token);
    res.json({was_validated: true});
  });
};
