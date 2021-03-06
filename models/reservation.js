// Require Mongoose
var mongoose = require('mongoose');

// Define schema

// Helper with Padding numbers
function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, 0);
}

var Schema = mongoose.Schema;

var ReservationSchema = new Schema(
  {
    name: {type: String, minLength: 1, maxLength: 100}, // Name of the person who reserves
    surname: {type: String, minLength: 1, maxLength: 100}, // Surname of the person who reserves
    email: {type: String, minLength: 1, maxLength: 100}, // Email of the person who reserves

    address: {type: String, minLength: 1, maxLength: 100}, // Address of the person who reserves
    zip: {type: String, minLength: 1, maxLength: 10}, // ZIP code of the person who reserves
    city: {type: String, minLength: 1, maxLength: 100}, // ZIP code of the person who reserves
    country: {type: String, minLength: 1, maxLength: 100}, // Country of the person who reserves

    person: {type: Number, min: 1, max: 14}, // Number of persons
    baby: {type: Number, min: 0, max: 1}, // Number of baby

    date_of_arrival: {type: Date, required: true},
    date_of_departure: {type: Date, required: true},

    pack: { type: String,
            enum: ['none', 'family', 'trip', 'all'],
            required: true,
            default: 'none'},

    session_token: {type: String, required: true, default: ''}, // Assigned token to keep track of a reservation

    is_validated: {type: Boolean, required: true, default: false}, // true if payed
    validated: {type: Date}, // Date of payment
    amount_paid: {type: Number, min: 0, default: 0}, // Amont paid for the reservation
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',},
    autoIndex: false, // Need to check what it means, seem to be better to set it to false in production (https://mongoosejs.com/docs/guide.html#indexes)
  },
);

// Virtual for trip span (not used)
ReservationSchema
.virtual('tripspan')
.get(function () {
  return (this.date_of_departure - this.date_of_arrival) / (86400000); // 1day = 1000 * 3600 * 24 millisecond
});

// Virtual for iCAL GREGORIAN date format, date of arrival (add 1 to month, start at 0)
ReservationSchema
.virtual('date_of_arrival_iCAL')
.get(function () {
  return  `${leftFillNum(this.date_of_arrival.getFullYear(), 4)}${leftFillNum(this.date_of_arrival.getMonth() + 1, 2)}${leftFillNum(this.date_of_arrival.getDate(), 2)}`;
});

// Virtual for iCAL GREGORIAN date format, date of departure (add 1 to month, start at 0)
ReservationSchema
.virtual('date_of_departure_iCAL')
.get(function () {
  return  `${leftFillNum(this.date_of_departure.getFullYear(), 4)}${leftFillNum(this.date_of_departure.getMonth() + 1, 2)}${leftFillNum(this.date_of_departure.getDate(), 2)}`;
});

// Assign function to return valid reservation queries (already validated or updated not long ago - 30 min max-)
ReservationSchema.query.byValidOnes = function() {
  // OR can misbeahve with index (do not understand how they work), see more at (https://docs.mongodb.com/manual/reference/operator/query/or/)
  return this.where({$or: [
    {is_validated: true},
    {updated_at: {
      $gt: new Date(Date.now() - 1800000) // 1800000 millisecond is 30min
    }},
  ]});
};

// Assign function to return none valid reservation queries (already validated or updated not long ago - 30 min max-)
ReservationSchema.query.byNoneValidOnes = function() {
  // OR can misbeahve with index (do not understand how they work), see more at (https://docs.mongodb.com/manual/reference/operator/query/or/)
  return this.where({$and: [
    {is_validated: false},
    {updated_at: {
      $lt: new Date(Date.now() - 1800000) // 1800000 millisecond is 30min
    }},
  ]});
};



// Assign function to return reservation that need to be payed (filled and not payed yet)
ReservationSchema.query.byPayableOnes = function() {
return this.where({$and: [
  // Every fields has been filled
  {name: {$not: {$eq: null}}},
  {surname: {$not: {$eq: null}}},
  {email: {$not: {$eq: null}}},
  {address: {$not: {$eq: null}}},
  {zip: {$not: {$eq: null}}},
  {city: {$not: {$eq: null}}},
  {country: {$not: {$eq: null}}},
  // Add persons and babies when implemented
  {is_validated: false},
]});
};



// Export model
module.exports = mongoose.model('Reservation', ReservationSchema);
