const async = require('async');

// Import Strip to handle payment
const stripe = require('stripe');

function calculateReservationAmount(reservation) {
  return 1000; // in cents (EUR)
};

exports.create_payment_intent = function(req, res) {
  // Get user reservation to set price

  async.parallel({
    clientSecret: function(callback) {
      // Create a PaymentIntent with the order amount and currency
      stripe.paymentIntent.create({
        amount: calculateReservationAmount(null),
        currency: 'eur'
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
    res.json({clientSecret: results.clientSecret});
  });
};
