const async = require('async');

console.log('This script populates some test reservations.');

// Get arguments passed on command line
const passwords = require('./secrets/passwords');

const Reservation = require('./models/reservation');



const mongoose = require('mongoose');
const mongoDB = passwords.mongo;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const reservations = []

function reservationCreate(inputs, cb) {
  var reservation = new Reservation({
    date_of_arrival: inputs.date_of_arrival,
    date_of_departure: inputs.date_of_departure,
    pack: inputs.pack,
    session_token: inputs.session_token,
    created: inputs.created,
    is_validated: inputs.is_validated});

  reservation.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    };
    console.log('New Reservation: ' + reservation);
    reservations.push(reservation)
    cb(null, reservation);
  });
};

function createReservations(cb) {
    async.series([
        function(callback) {
          reservationCreate({
            date_of_arrival: new Date(2020, 11, 23),
            date_of_departure: new Date(2020, 11, 28),
            pack: 'none',
            session_token: '1',
            created: new Date(2020, 11, 10),
            is_validated: true,
          }, callback);
        },
        function(callback) {
          reservationCreate({
            date_of_arrival: new Date(2020, 11, 29),
            date_of_departure: new Date(2020, 11, 30),
            pack: 'trip',
            session_token: '2',
            created: new Date(2020, 10, 20),
            is_validated: false,
          }, callback);
        },
        function(callback) {
          reservationCreate({
            date_of_arrival: new Date(2020, 10, 12),
            date_of_departure: new Date(2020, 10, 25),
            pack: 'family',
            session_token: '3',
            created: new Date(2020, 10, 5),
            is_validated: true,
          }, callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createReservations,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    }
    else {
        console.log('Reservations: ' + reservations);

    }
    // All done, disconnect from database
    mongoose.connection.close();
});
