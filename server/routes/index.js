const passport = require('passport');
let userModel = require('../model/user');
let User = userModel.User;

var express = require('express');
var router = express.Router();

/* Function for Get profileImageUrl */
function getProfileImage(req) {
  return req.user && req.user.profileImageData ? '/users/profile-image/' + req.user._id.toString() : "";
}

/* GET home page */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Home',
    displayName: req.user ? req.user.displayName : "",
    profileImageUrl: getProfileImage(req),
    user: req.user || null
  });
});

/* GET game page */
router.get('/game', function(req, res, next) {
  res.render('game', { 
    title: 'Play',
    displayName: req.user ? req.user.displayName : "",
    profileImageUrl: getProfileImage(req),
    user: req.user || null
  });
});

/* GET about page */
router.get('/about', function(req, res, next) {
  res.render('about', { 
    title: 'About',
    displayName: req.user ? req.user.displayName : "",
    profileImageUrl: getProfileImage(req),
    user: req.user || null
  });
});

/* GET contact page */
router.get('/contact', function(req, res, next) {
  res.render('contact', { 
    title: 'Contact',
    displayName: req.user ? req.user.displayName : "",
    profileImageUrl: getProfileImage(req),
    user: req.user || null
  });
});

/* GET login page */
router.get('/login', function(req,res,next){
  if(!req.user) {
    res.render('auth/login', {
      title: 'Login',
      message: req.flash('loginMessage'),
      displayName: "",
      profileImageUrl: ""
    });
  } else {
    return res.redirect("/");
  }
});

/* POST login */
router.post('/login', function(req,res,next){
  passport.authenticate('local',(err,user,info)=>{
    if(err) {
      return next(err);
    }
    if(!user) {
      req.flash('loginMessage','Authentication Error: Invalid username or password');
      return res.redirect('/login');
    }
    req.login(user,(err)=>{
      if(err) {
        return next(err);
      }
      return res.redirect("/typingRecords");
    });
  })(req,res,next);
});

/* GET register page */
router.get('/register', function(req,res,next){
  if(!req.user) {
    res.render('auth/register', {
      title: 'Register',
      message: req.flash('registerMessage'),
      displayName: "",
      profileImageUrl: ""
    });
  } else {
    return res.redirect("/");
  }
});

/* POST register */
router.post('/register', function(req,res,next){
  let newUser = new User({
    username: req.body.username,
    email: req.body.email,
    displayName: req.body.displayName
  });

  User.register(newUser, req.body.password, (err)=>{
    if(err) {
      console.log("Error:Inserting the new user");
      if(err.name=="UserExistingError") {
        req.flash('registerMessage','Registration Error: User already exists');
      }
      return res.render('auth/register', {
        title: 'Register',
        message: req.flash('registerMessage'),
        displayName: "",
        profileImageUrl: ""
      });
    }
    else {
      return passport.authenticate('local')(req,res,()=>{
        res.redirect("/typingRecords");
      });
    }
  });
});

/* Google OAuth Routes */
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
  function (req, res) {
    return res.redirect('/typingRecords');
  }
);

/* GitHub OAuth Routes */
router.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', failureFlash: true }),
  function (req, res) {
    return res.redirect('/typingRecords');
  }
);

/* Logout */
router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if(err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;