var express = require('express');
var router = express.Router();

/* GET home page */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Home',
    displayName: ""
  });
});

/* GET game page */
router.get('/game', function(req, res, next) {
  res.render('game', { 
    title: 'Play',
    displayName: ""
  });
});

/* GET about page */
router.get('/about', function(req, res, next) {
  res.render('about', { 
    title: 'About',
    displayName: ""
  });
});

/* GET contact page */
router.get('/contact', function(req, res, next) {
  res.render('contact', { 
    title: 'Contact',
    displayName: ""
  });
});

module.exports = router;