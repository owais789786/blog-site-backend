const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../modules/users/user.model');
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email,
        googleId: profile.id,
        authProvider: 'google',
        isEmailVerified: true
      });
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));