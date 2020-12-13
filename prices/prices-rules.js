// NEED TO CHECK IF IT IS SECURE TO USE IT IN PRODUCTION
// ONLY FOR DEVELOPMENT


////////// ////////// //////////
////////// ////////// HOW IT WORKS ?
////////// ////////// PRICE ARE SET IN EURO €
////////// ////////// //////////
////////// Enter the price or operation (+ / -)
////////// The rules are read bottom to top
////////// The first price encounter is the price set
////////// Add or subtract if the rule is an operation
////////// The price is "per day/night"
////////// GENERAL rule is alway a price
////////// ////////// //////////
////////// ////////// HELP
////////// ////////// //////////
////////// Rules are writen as VALUE:TEXT
////////// ////////// //////////
////////// VALUS is as follow
////////// YYYY is the year number
////////// MM is the year number, January is 0
////////// DD is the date number
////////// D is the day number, Monday is 0
////////// ////////// //////////
////////// With TEXT being +,- or nothing THEN a NUMBER
////////// TEXT is always between "" or ''
////////// "" or '' are not needed when is the price value (i.e not an operation)
////////// Exemple of TEXT:
////////// '130'  --- Price is 130€
////////// '-20'  --- Substract 20€ to the price
////////// "+40"  --- Add 40€ to the price
////////// 100    --- Price is 100€
////////// ////////// //////////
////////// general is a NUMBER (TYPEOF), thus there are no "" or ''
////////// ////////// EXEMPLE
////////// ////////// //////////
////////// To set the price be 100 per night in 2021, 150 otherwise
////////// Then to substract 30 on Monday and add 20 on Friday
////////// exports.general = 150;
////////// exports.year = {2021: '100'};
////////// exports.day = {0: '-30', 4: '+20'};
////////// ////////// //////////

exports.general = 10;

exports.year = {2021: '+30'};

exports.month = {0: '-5'};

exports.day = {};

exports.date = {};
