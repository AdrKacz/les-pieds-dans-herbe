// Require Mongoose
var mongoose = require('mongoose');

// Define schema

var Schema = mongoose.Schema;

var ReservationSchema = new Schema(
  {
    name: {type: String, minLength: 1, maxLength: 100},
    surname: {type: String, minLength: 1, maxLength: 100},
    email: {type: String, minLength: 1, maxLength: 100},
    address: {type: String, minLength: 1, maxLength: 100},
    country: {type: String, minLength: 1, maxLength: 100},
    zip: {type: Number, minLength: 1, maxLength: 100},
    date_of_arrival: {type: Date, required: true},
    date_of_departure: {type: Date, required: true},
    pack: { type: String,
            enum: ['none', 'family', , 'travel', 'full'],
            required: true}
    id_token: {type: String, required: true},
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
