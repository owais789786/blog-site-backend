const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const AppError = require('../../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new AppError('No user found with this id', 404));
    }
    next();
  } catch (err) {
    return next(new AppError('Not authorized to access this route', 401));
  }
};

module.exports = { protect };
