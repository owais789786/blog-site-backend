const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve()
        .then(() => handler(req, res, next))
        .catch((err) => next(err));

module.exports = asyncHandler;