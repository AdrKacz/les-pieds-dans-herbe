// Require Mongoose
var mongoose = require('mongoose');

// Define schema

var Schema = mongoose.Schema;

var ReservationSchema = new Schema(
  {
    name: {type: String, minLength: 1, maxLength: 100}, // Name of the person who reserves
    surname: {type: String, minLength: 1, maxLength: 100}, // Surname of the person who reserves
    email: {type: String, minLength: 1, maxLength: 100}, // Email of the person who reserves

    address: {type: String, minLength: 1, maxLength: 100}, // Address of the person who reserves
    country: {type: String, minLength: 1, maxLength: 100}, // Country of the person who reserves
    zip: {type: Number, minLength: 1, maxLength: 100}, // ZIP code of the person who reserves

    person: {type: Number, min: 1, max: 14}, // Number of persons
    baby: {type: Number, min: 0, max: 1}, // Number of baby

    date_of_arrival: {type: Date, required: true},
    date_of_departure: {type: Date, required: true},

    pack: { type: String,
            enum: ['none', 'family', , 'travel', 'full'],
            required: true},

    session_token: {type: String, required: true}, // Assigned token to keep track of a reservation

    created: {type: Date, required: true, default: Date.now()}, // Date of first form validation

    is_validated: {type: Boolean, required: true, default: false}, // true if payed
    validated: {type: Date}, // Date of payment
  }
);

// Virtual for trip span
ReservationSchema
.virtual('tripspan')
.get(function () {
  return (this.date_of_departure - this.date_of_arrival) / (86400000); // 1000 * 3600 * 24 milli in a day
});

// Export model
module.exports = mongoose.model('Reservation', ReservationSchema);
