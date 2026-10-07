const logger = require('../utils/logger');

// 1. Determine status code and normalize duplicate-key errors
const errorStatus = (err, req, res, next) => {
    if (err.code === 11000) {
        err.statusCode = 409;
        err.message = 'An account with this email already exists.';
    } else if (err.code === 'EBADCSRFTOKEN') {
        err.statusCode = 403;
        err.message = 'Invalid CSRF token. Please refresh the page.';
    } else {
        err.statusCode = err.statusCode || err.status || 500;
    }
    next(err);
};

// 2. Log error
const logErrors = (err, req, res, next) => {
    logger.error(`${req.method} ${req.url} - ${err.message}`);
    next(err);
};

// 3. Format error response
const formatError = (err, req, res, next) => {
    err.formattedMessage = err.message || 'Internal Server Error';
    next(err);
};

// 4. Send response to client
const sendErrorResponse = (err, req, res, next) => {
    res.status(err.statusCode).json({
        success: false,
        message: err.formattedMessage,
    });
};

    module.exports = { logErrors, errorStatus, formatError, sendErrorResponse };