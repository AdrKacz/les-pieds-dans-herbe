var express = require('express');
var router = express.Router();

var main_controller = require('../controllers/mainController')

/// MAIN ROUTES ///

// REDIRECT To Home Page
router.get('/', function(req, res) {
  res.redirect('/home');
});

// GET Home Page
router.get('/home', main_controller.home);

// GET Details Page
router.get('/details', main_controller.details_get);

// POST Details Page
router.post('/details', main_controller.details_post);

// GET Book Page
router.get('/book', main_controller.book_get);

// POST Book Page
router.post('/book', main_controller.book_post);

module.exports = router;
