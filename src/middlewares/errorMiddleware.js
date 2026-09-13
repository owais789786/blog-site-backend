const logger = require('../utils/logger');

// 1. Log error
const logErrors = (err, req, res, next) => {
    logger.error(`${req.method} ${req.url} - ${err.message}`);
    next(err);
};

// 2. Determine status code
const errorStatus = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
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