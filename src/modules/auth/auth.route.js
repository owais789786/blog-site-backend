const passport = require('passport');
const { googleAuth } = require('./auth.controller');
const router = require('express').Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth?error=google` }),
  googleAuth
);

module.exports = router; 