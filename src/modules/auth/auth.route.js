const passport = require('passport');
const { googleAuth, login, register, getMe, logout } = require('./auth.controller');
const router = require('express').Router();

const { protect } = require('./auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth?error=google` }),
  googleAuth
);

module.exports = router;  