const jwt = require("jsonwebtoken");
const config = require("../config");
const HttpError = require("../util/http-error");

const COOKIE_NAME = "hector_session";

/**
 * Issue a signed session token and set it as an httpOnly cookie.
 *
 * httpOnly means page JavaScript cannot read it, so an XSS bug cannot exfiltrate
 * the session. SameSite=strict means a third-party site cannot make the browser
 * send it, which is what removes the need for a separate CSRF token here.
 */
function issueSession(res, user) {
	const token = jwt.sign({ sub: String(user._id) }, config.JWT_SECRET, {
		expiresIn: config.JWT_EXPIRES_IN,
	});

	res.cookie(COOKIE_NAME, token, {
		httpOnly: true,
		secure: config.isProduction,
		sameSite: "strict",
		path: "/",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	return token;
}

function clearSession(res) {
	res.clearCookie(COOKIE_NAME, {
		httpOnly: true,
		secure: config.isProduction,
		sameSite: "strict",
		path: "/",
	});
}

function readToken(req) {
	if (req.cookies && req.cookies[COOKIE_NAME]) {
		return req.cookies[COOKIE_NAME];
	}
	// Also accept a bearer token so the API stays usable from curl, Postman
	// and any non-browser client.
	const header = req.get("authorization");
	if (header && header.startsWith("Bearer ")) {
		return header.slice(7);
	}
	return null;
}

/** Reject the request unless it carries a valid session. */
function requireAuth(req, res, next) {
	const token = readToken(req);
	if (!token) {
		return next(HttpError.unauthorized());
	}
	try {
		const payload = jwt.verify(token, config.JWT_SECRET);
		req.userId = payload.sub;
		return next();
	} catch {
		return next(HttpError.unauthorized("Session expired or invalid"));
	}
}

/** Attach req.userId when a valid session exists, but never reject. */
function optionalAuth(req, res, next) {
	const token = readToken(req);
	if (token) {
		try {
			req.userId = jwt.verify(token, config.JWT_SECRET).sub;
		} catch {
			/* an invalid token is simply treated as anonymous */
		}
	}
	return next();
}

/**
 * Guard for routes shaped `/users/:uid/...`: the caller must be that user.
 * This is the check that was missing entirely; previously anyone could
 * `DELETE /api/v1/users/<anyone's id>`.
 */
function requireSelf(paramName = "uid") {
	return (req, res, next) => {
		if (!req.userId) {
			return next(HttpError.unauthorized());
		}
		if (req.params[paramName] !== req.userId) {
			return next(
				HttpError.forbidden("You can only modify your own account")
			);
		}
		return next();
	};
}

module.exports = {
	COOKIE_NAME,
	issueSession,
	clearSession,
	requireAuth,
	optionalAuth,
	requireSelf,
};
