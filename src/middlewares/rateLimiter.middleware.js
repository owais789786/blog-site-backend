const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const handler = (req, res, next, options) => {
    logger.warn(`Rate limit hit: ${req.ip} ${req.method} ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
};

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        message: 'Too many requests, try after some time'
    },
    handler
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        message: 'Too many requests, try after some time'
    },
    handler
})

module.exports = { apiLimiter, authLimiter }