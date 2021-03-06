const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
// const logger = require('morgan');

const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');

// Use to access session, not made for production, data stock server-side
// Look at MemoryStore for production
const session = require('express-session');

const compression = require('compression');
const helmet = require('helmet');

// Import the mongoose module
const mongoose = require('mongoose');

var app = express();

// Set up default mongoose connection
const passwords = require('./secrets/passwords'); // [DEV] Use only in development
const mongoDB = passwords.mongo; // [DEV] Use only in development

// var mongoDB = process.env.MONGODB_URI; // [PROD] Use only in production
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

// Get the default connection
var db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// [PROD] Use only in production, problem with static files else
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//       "connect-src": ["'self'", "https://api.stripe.com"],
//       "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
//       "script-src": ["'self'", "https://js.stripe.com"],
//     },
//   })
// );
// app.use(helmet.dnsPrefetchControl());
// app.use(helmet.expectCt());
// app.use(helmet.frameguard());
// app.use(helmet.hidePoweredBy());
// app.use(helmet.hsts());
// app.use(helmet.ieNoOpen());
// app.use(helmet.noSniff());
// app.use(helmet.permittedCrossDomainPolicies());
// app.use(helmet.referrerPolicy());
// app.use(helmet.xssFilter());
// -----

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser()); // Do not use with express-session
app.use(session({ // [DEV] only use in development
  secret:'dev-secret',
  resave: false, // Check the exact meaning
  saveUninitialized: false, // Check the exact meaning
  cookie: {
    maxAge: 86400000 // 1 day in milliseconds
  },
}));
// [PROD] --> Need to find an alternative to session above (or correct it for production)
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
