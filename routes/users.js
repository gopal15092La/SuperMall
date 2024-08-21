var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

// get Users model
var User = require('../models/user');

/*
 * GET register
*/
router.get('/register', function (req, res, next) {
    
  res.render('register', {
    title: 'Register',
    user: null,
  });

});

/*
 * POST register
*/

// router.post('/register',async (req, res, next) => {

//   var name = req.body.name;
//   var email = req.body.email;
//   var username = req.body.username;
//   var password = req.body.password;
//   var password2 = req.body.password2;

//   req.checkBody('name', 'Name is required!').notEmpty();
//   req.checkBody('email', 'Email is required!').isEmail();
//   req.checkBody('username', 'Username is required!').notEmpty();
//   req.checkBody('password', 'Password is required!').notEmpty();
//   req.checkBody('password2', 'Passwords do not match!').equals(password);

//   var errors = req.validationErrors();

//   if (errors) {
//     res.render('register', {
//       errors: errors,
//       user: null,
//       title: 'Register'
//     });
//   } else {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) console.log(err);

//       if (user) {
//         req.flash('danger', 'Username exists, please choose another');
//         res.redirect('/users/register');
//       } else {
//         var user = new User({
//           name: name,
//           email: email,
//           username: username,
//           password: password,
//           admin: 0
//         });
//         bcrypt.genSalt(10, function (err, salt) {
//           bcrypt.hash(user.password, salt, function (err, hash) {
//             if (err) console.log(err);

//             user.password = hash;

//             user.save(function (err) {
//               if (err) {
//                 console.log(err);
//               } else {
//                 req.flash('success', 'You are now register!');
//                 res.redirect('/login')
//               }
//             });
//           });
//         });
//       }
//     });

//   }

// });


router.post('/register', async (req, res, next) => {
    try {
      const { name, email, username, password, password2 } = req.body;
  
      // Validation
      req.checkBody('name', 'Name is required!').notEmpty();
      req.checkBody('email', 'Email is required!').isEmail();
      req.checkBody('username', 'Username is required!').notEmpty();
      req.checkBody('password', 'Password is required!').notEmpty();
      req.checkBody('password2', 'Passwords do not match!').equals(password);
  
      const errors = req.validationErrors();
  
      if (errors) {
        return res.render('register', {
          errors: errors,
          user: null,
          title: 'Register'
        });
      }
  
      // Check if username already exists
      const existingUser = await User.findOne({ username: username });
  
      if (existingUser) {
        req.flash('danger', 'Username exists, please choose another');
        return res.redirect('/users/register');
      }
  
      // Create new user
      const user = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        admin: (name == "admin") ?1 : 0
      });
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
  
      // Save user
      await user.save();
  
      req.flash('success', 'You are now registered!');
      res.redirect('/login');
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  

/*
 * GET login
*/
router.get('/login', function (req, res, next) {

  if (res.locals.user) res.redirect('/');

  res.render('login', {
    title: 'Log In'
  });

});

/*
 * POST login
*/
router.post('/login', function (req, res, next) {

  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);

});

/*
 * GET logout
*/
router.get('/logout', function (req, res, next) {

  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');
  });
  
});



module.exports = router;