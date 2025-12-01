var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let session = require('express-session');
let passport = require('passport');
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;
let GoogleStrategy = require('passport-google-oauth20').Strategy;
let GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config();   
let flash = require('connect-flash');
let cors = require('cors');
let userModel = require('../model/user');
let User = userModel.User;

let mongoose = require('mongoose');
const DB = require('./db');

console.log('Loaded Mongo URI:', DB.URI);
mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'Connection Error'));
mongoDB.once('open', () => {
  console.log('Connected to MongoDB');
});

var indexRouter = require('../routes/index');
var typingRecordRouter = require('../routes/typingRecord');
var usersRouter = require('../routes/users');

var app = express();

// Set-up Express Session
app.use(session({
  secret:"Somesecret",
  saveUninitialized:false,
  resave:false
}))
// initialize flash
app.use(flash());

// user authentication
passport.use(User.createStrategy());

// serialize and deserialize the user information
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      let existingUser = await User.findOne({ googleId: profile.id });

      if (!existingUser && profile.emails && profile.emails.length > 0) {
        existingUser = await User.findOne({ email: profile.emails[0].value });
      }

      if (!existingUser) {
        existingUser = new User({
          username: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : profile.id,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : "",
          displayName: profile.displayName || (profile.name && profile.name.givenName) || "Google User",
          googleId: profile.id
        });
        await existingUser.save();
      } else if (!existingUser.googleId) {
        existingUser.googleId = profile.id;
        await existingUser.save();
      }

      return done(null, existingUser);
    } catch (err) {
      return done(err, null);
    }
  }
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      let existingUser = await User.findOne({ githubId: profile.id });
      if (!existingUser && profile.emails && profile.emails.length > 0) {
        existingUser = await User.findOne({ email: profile.emails[0].value });
      }

      if (!existingUser) {
        existingUser = new User({
          username: profile.username || profile.id,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : "",
          displayName: profile.displayName || profile.username || "GitHub User",
          githubId: profile.id
        });
        await existingUser.save();
      } else if (!existingUser.githubId) {
        existingUser.githubId = profile.id;
        await existingUser.save();
      }

      return done(null, existingUser);
    } catch (err) {
      return done(err, null);
    }
  }
));

// initialize the passport
app.use(passport.initialize());
app.use(passport.session());

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
app.use('/typingRecords', typingRecordRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;