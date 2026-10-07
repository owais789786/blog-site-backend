const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../users/user.model');
const asyncHandler = require('../../utils/asyncHandler');

const AppError = require('../../utils/AppError');

const createAuthError = (message, statusCode) => {
  return new AppError(message, statusCode);
};

const getAuthToken = (userId) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET is not configured.');
  }

  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

const setAuthCookie = (res, userId) => {
  res.cookie('token', getAuthToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const toPublicUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
});

const validateCredentials = ({ firstName, email, password }, isRegistration) => {
  if (isRegistration) {
    if (typeof firstName !== 'string' || !firstName.trim()) {
      throw createAuthError('First name is required.', 400);
    }
    if (firstName.trim().length > 80) {
      throw createAuthError('First name must be 80 characters or fewer.', 400);
    }
  }

  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw createAuthError('Enter a valid email address.', 400);
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw createAuthError(
      isRegistration ? 'Password must be between 8 and 128 characters.' : 'Invalid email or password.',
      isRegistration ? 400 : 401
    );
  }
};

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body || {};
  validateCredentials({ firstName, email, password }, true);

  if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim().length > 80)) {
    throw createAuthError('Last name must be 80 characters or fewer.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw createAuthError('An account with this email already exists.', 409);
  } 

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: typeof lastName === 'string' ? lastName.trim() : '',
    email: normalizedEmail,
    password: password,
  });

  setAuthCookie(res, user._id);
  return res.status(201).json({
    success: true,
    message: 'Your account has been created.',
    user: toPublicUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  validateCredentials({ email, password }, false);

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const passwordMatches =
    user?.authProvider === 'local' &&
    typeof user.password === 'string' &&
    await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw createAuthError('Invalid email or password.', 401);
  }

  setAuthCookie(res, user._id);
  return res.json({
    success: true,
    message: 'You are signed in.',
    user: toPublicUser(user),
  });
});

const googleAuth = asyncHandler(async (req, res) => {
  setAuthCookie(res, req.user._id);
  return res.redirect(process.env.CLIENT_URL);
});

const getMe = asyncHandler(async (req, res) => {
  return res.json({
    success: true,
    user: toPublicUser(req.user),
  });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  return res.json({
    success: true,
    message: 'User logged out successfully',
  });
});

module.exports = { googleAuth, login, register, getMe, logout };