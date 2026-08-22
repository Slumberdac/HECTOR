/**
 * Wrap an async route handler so a rejected promise reaches express' error
 * handler instead of becoming an unhandled rejection.
 *
 * This is what lets the controllers below be written as straight-line code:
 * every `throw` lands in `errorHandler`, so there are no try/catch blocks that
 * swallow the real cause and no handlers that respond twice.
 */
const asyncHandler = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
