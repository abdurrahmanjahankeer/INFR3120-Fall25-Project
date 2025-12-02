// server/routes/users.js
const express = require('express');
const multer = require('multer');
const { User } = require('../model/user');

const router = express.Router();

// Simple auth guard
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Multer memory storage – no files on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// GET: profile picture upload form
router.get('/profile-picture', requireAuth, function (req, res) {
  res.render('account/profile-picture', {
    title: 'Profile Picture',
    displayName: req.user ? req.user.displayName : '',
    // URL that will stream image from MongoDB
    profileImageUrl: req.user && req.user.profileImageData
      ? '/users/profile-image/' + req.user._id.toString()
      : '',
    message: ''
  });
});

// POST: upload profile picture (store in MongoDB)
router.post(
  '/profile-picture',
  requireAuth,
  upload.single('profileImage'),
  async function (req, res) {
    try {
      // If user clicked "Remove Profile Picture"
      if (req.body.removeImage === 'true') {
        await User.updateOne(
          { _id: req.user._id },
          {
            $unset: { profileImageData: "", profileImageType: "" },
            $set: { updated: new Date() }
          }
        );

        req.user.profileImageData = undefined;
        req.user.profileImageType = undefined;

        return res.render('account/profile-picture', {
          title: 'Profile Picture',
          displayName: req.user.displayName,
          profileImageUrl: '',
          message: 'Profile picture removed. Using default avatar.'
        });
      }

      // Otherwise, handle normal upload
      if (!req.file) {
        return res.render('account/profile-picture', {
          title: 'Profile Picture',
          displayName: req.user.displayName,
          profileImageUrl: req.user && req.user.profileImageData
            ? '/users/profile-image/' + req.user._id.toString()
            : '',
          message: 'Please choose an image file to upload.'
        });
      }

      await User.updateOne(
        { _id: req.user._id },
        {
          $set: {
            profileImageData: req.file.buffer,
            profileImageType: req.file.mimetype,
            updated: new Date()
          }
        }
      );

      req.user.profileImageData = req.file.buffer;
      req.user.profileImageType = req.file.mimetype;

      res.render('account/profile-picture', {
        title: 'Profile Picture',
        displayName: req.user.displayName,
        profileImageUrl: '/users/profile-image/' + req.user._id.toString(),
        message: 'Profile picture updated successfully.'
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error uploading profile picture.');
    }
  }
);

// GET: stream profile image bytes from MongoDB
router.get('/profile-image/:id', async function (req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      'profileImageData profileImageType'
    );

    if (!user || !user.profileImageData) {
      // fallback – you can point this to a default avatar in /public
      return res.redirect('/Asset/images/default-avatar.png');
    }

    res.set('Content-Type', user.profileImageType || 'image/png');
    res.send(user.profileImageData);
  } catch (err) {
    console.error(err);
    res.status(404).end();
  }
});

// GET: change password form
router.get('/change-password', requireAuth, function (req, res) {
  res.render('account/change-password', {
    title: 'Change Password',
    displayName: req.user.displayName,
    profileImageUrl: req.user && req.user.profileImageData
      ? '/users/profile-image/' + req.user._id.toString()
      : '',
    message: ''
  });
});

// POST: change password
router.post('/change-password', requireAuth, function (req, res) {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.render('account/change-password', {
      title: 'Change Password',
      displayName: req.user.displayName,
      profileImageUrl: req.user && req.user.profileImageData
        ? '/users/profile-image/' + req.user._id.toString()
        : '',
      message: 'Please fill in all fields.'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render('account/change-password', {
      title: 'Change Password',
      displayName: req.user.displayName,
      profileImageUrl: req.user && req.user.profileImageData
        ? '/users/profile-image/' + req.user._id.toString()
        : '',
      message: 'New passwords do not match.'
    });
  }

  // passport-local-mongoose helper
  req.user.changePassword(currentPassword, newPassword, function (err) {
    if (err) {
      console.error(err);
      return res.render('account/change-password', {
        title: 'Change Password',
        displayName: req.user.displayName,
        profileImageUrl: req.user && req.user.profileImageData
          ? '/users/profile-image/' + req.user._id.toString()
          : '',
        message: 'Current password is incorrect or could not be changed.'
      });
    }

    res.render('account/change-password', {
      title: 'Change Password',
      displayName: req.user.displayName,
      profileImageUrl: req.user && req.user.profileImageData
        ? '/users/profile-image/' + req.user._id.toString()
        : '',
      message: 'Password changed successfully.'
    });
  });
});

module.exports = router;