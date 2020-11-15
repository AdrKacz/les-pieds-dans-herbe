exports.home = function(req, res, next) {
  res.render('home', {title: 'HOME PAGE - NOT IMPLEMENTED'});
};

exports.details_get = function(req, res, next) {
  res.render('details', {title: 'DETAILS PAGE GET - NOT IMPLEMENTED'});
};

exports.details_post = [
  (req, res, next) => {
    console.log('--- POST REQ ---')
    console.log(req.body);
    res.redirect('/book');
  }
];

exports.book_get = function(req, res, next) {
  res.render('book', {title: 'BOOK PAGE GET - NOT IMPLEMENTED'});
};

exports.book_post = function(req, res, next) {
  res.render('book', {title: 'BOOK PAGE POST - NOT IMPLEMENTED', errors: null});
};
