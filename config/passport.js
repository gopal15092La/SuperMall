var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bcrypt = require('bcryptjs');

module.exports = function (passport) {
  passport.use(new LocalStrategy(
    async function (username, password, done) {
      try {
        // Find user by username
        const user = await User.findOne({ username: username });

        if (!user) {
          return done(null, false, { message: 'No user found!' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Wrong password!' });
        }
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};