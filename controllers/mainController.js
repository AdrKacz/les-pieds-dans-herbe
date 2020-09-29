exports.home = function(req, res, next) {
  res.render('home', {title: 'HOME PAGE - NOT IMPLEMENTED'});
};

exports.details_get = function(req, res, next) {
  res.render('details', {title: 'DETAILS PAGE GET - NOT IMPLEMENTED'});
};

exports.details_post = function(req, res, next) {
<<<<<<< HEAD
  res.render('details', {title: 'DETAILS PAGE POST - NOT IMPLEMENTED', errors: null});
=======
  res.render('details', {title: 'DETAILS PAGE POST - NOT IMPLEMENTED', errors: n});
>>>>>>> 8d6df6c99f4cb64fce52d097fd92421969f5487f
};

exports.book_get = function(req, res, next) {
  res.render('book', {title: 'BOOK PAGE GET - NOT IMPLEMENTED'});
};

exports.book_post = function(req, res, next) {
  res.render('book', {title: 'BOOK PAGE POST - NOT IMPLEMENTED', errors: null});
};
