var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let mongoose = require('mongoose');
let DB = require('./db');

// COMMENTED OUT DATABASE - Add back later when needed
/*
let session = require('express-session');
let passport = require('passport');
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;
let flash = require('connect-flash');
let cors = require('cors');
let userModel = require('../model/user');
let User = userModel.User;
*/

mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind('console', 'Connection Error'));
mongoDB.once('open', () => {
  console.log('Connected to the MongoDB');
});


var indexRouter = require('../routes/index');
/* var typingRecordRouter = require('../routes/typingRecord'); */
var usersRouter = require('../routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

app.use('/', indexRouter);
/* app.use('/typingRecords', typingRecordRouter); */
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // FIX: Pass title to error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;
