let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');

let User = mongoose.Schema({
  username:
  {
    type: String,
    default: "",
    trim: true,
    required: 'Username is required'
  },
  email:
  {
    type: String,
    default: "",
    trim: true,
    required: 'email is required'
  },
  displayName:
  {
    type: String,
    default: "",
    trim: true,
    required: 'displayName is required'
  },
  profileImageUrl:
  {
    type: String,
    default: ""
  },
  profileImageData:
  {
    type: Buffer
  },
  profileImageType:
  {
    type: String,
    default: ""
  },
  googleId:
  {
    type: String,
    default: ""
  },
  githubId:
  {
    type: String,
    default: ""
  },
  resetPasswordToken:
  {
    type: String,
    default: ""
  },
  resetPasswordExpires:
  {
    type: Date
  },
  created:
  {
    type: Date,
    default: Date.now
  },
  updated:
  {
    type: Date,
    default: Date.now
  }
},
{
  collection: "user"
});

let options = ({ MissingPasswordError: 'Wrong/Missing Password' });
User.plugin(passportLocalMongoose, options);
module.exports.User = mongoose.model('User', User);