/**
 * An error carrying the HTTP status code that should be sent to the client.
 *
 * Anything thrown that is *not* an HttpError is treated as an unexpected
 * failure by the error handler and reported as a generic 500, so internal
 * details never leak into a response body.
 */
class HttpError extends Error {
	/**
	 * @param {string} message  Message safe to show the client.
	 * @param {number} statusCode  HTTP status code, defaults to 500.
	 * @param {object} [details]  Optional structured detail (e.g. field errors).
	 */
	constructor(message, statusCode = 500, details = undefined) {
		super(message);
		this.name = "HttpError";
		this.statusCode = statusCode;
		this.details = details;
		Error.captureStackTrace(this, HttpError);
	}

	static badRequest(message, details) {
		return new HttpError(message, 400, details);
	}

	static unauthorized(message = "Authentication required") {
		return new HttpError(message, 401);
	}

	static forbidden(message = "You are not allowed to do that") {
		return new HttpError(message, 403);
	}

	static notFound(message = "Not found") {
		return new HttpError(message, 404);
	}

	static conflict(message) {
		return new HttpError(message, 409);
	}

	static unprocessable(message, details) {
		return new HttpError(message, 422, details);
	}
}

module.exports = HttpError;
