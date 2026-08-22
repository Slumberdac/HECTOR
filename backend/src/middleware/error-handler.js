const HttpError = require("../util/http-error");
const logger = require("../lib/logger");
const config = require("../config");

/** Catch-all for unmatched routes. Runs after every registered router. */
function notFoundHandler(req, res, next) {
	next(HttpError.notFound(`No route for ${req.method} ${req.originalUrl}`));
}

/**
 * Terminal error handler.
 *
 * The previous version read `error.code`, while HttpError set `statusCode` —
 * so every deliberate 4xx was reported to the client as a 500. This reads the
 * right property and refuses to echo unexpected internal errors.
 */
function errorHandler(error, req, res, next) {
	if (res.headersSent) {
		return next(error);
	}

	// body-parser rejects oversized or malformed payloads with its own error
	// shape. Translate those into the same contract as everything else instead
	// of letting them fall through as a bare 500.
	if (!(error instanceof HttpError) && error.type) {
		if (error.type === "entity.too.large") {
			error = HttpError.badRequest("Request body is too large");
			error.statusCode = 413;
		} else if (error.type === "entity.parse.failed") {
			error = HttpError.badRequest("Request body is not valid JSON");
		}
	}

	const isKnown = error instanceof HttpError;
	const status = isKnown ? error.statusCode : 500;

	if (status >= 500) {
		logger.error({ err: error }, "Unhandled error while serving request");
	} else {
		logger.warn({ err: error.message, status }, "Request rejected");
	}

	const body = {
		message: isKnown ? error.message : "An unexpected error occurred",
	};
	if (isKnown && error.details) {
		body.details = error.details;
	}
	// Stack traces are useful locally and are a disclosure risk in production.
	if (!config.isProduction && status >= 500) {
		body.stack = error.stack;
	}

	res.status(status).json(body);
}

module.exports = { errorHandler, notFoundHandler };
