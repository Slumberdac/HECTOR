const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const config = require("./config");
const logger = require("./lib/logger");
const { optionalAuth } = require("./middleware/auth");
const { errorHandler, notFoundHandler } = require("./middleware/error-handler");

const authRoutes = require("./routes/auth-routes");
const rocksRoutes = require("./routes/rocks-routes");
const usersRoutes = require("./routes/users-routes");

/**
 * Builds the express application.
 *
 * Kept separate from server.js (which owns the database connection and the
 * listening socket) so tests can mount the app without opening a port.
 */
function createApp() {
	const app = express();

	// Behind Caddy/cloudflared, the socket peer is the proxy. Without this the
	// rate limiter would see every request as coming from one IP.
	if (config.TRUST_PROXY > 0) {
		app.set("trust proxy", config.TRUST_PROXY);
	}
	app.disable("x-powered-by");

	app.use(
		helmet({
			// The API serves JSON only; the frontend is a separate origin-less
			// static bundle served by Caddy, which sets its own CSP.
			contentSecurityPolicy: false,
			crossOriginResourcePolicy: { policy: "same-site" },
		})
	);

	// In production the frontend and API share an origin behind the reverse
	// proxy, so CORS_ORIGINS is empty and no CORS headers are emitted at all.
	// The old code sent `Access-Control-Allow-Origin: *` unconditionally.
	if (config.CORS_ORIGINS.length > 0) {
		app.use(
			cors({
				origin: config.CORS_ORIGINS,
				credentials: true,
				methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			})
		);
	}

	app.use(express.json({ limit: "16kb" }));
	app.use(cookieParser());

	if (!config.isTest) {
		app.use(pinoHttp({ logger }));
	}

	// Liveness/readiness probe for Docker and for uptime monitoring.
	app.get("/healthz", (req, res) => {
		const dbUp = mongoose.connection.readyState === 1;
		res.status(dbUp ? 200 : 503).json({
			status: dbUp ? "ok" : "degraded",
			database: dbUp ? "connected" : "disconnected",
			uptime: Math.round(process.uptime()),
		});
	});

	// Broad ceiling for the whole API. Auth routes add a stricter one of
	// their own on top.
	app.use(
		"/api",
		rateLimit({
			windowMs: 60 * 1000,
			limit: 300,
			standardHeaders: "draft-7",
			legacyHeaders: false,
		})
	);

	// Populates req.userId when a session cookie is present, so controllers can
	// make ownership decisions on otherwise public routes.
	app.use("/api", optionalAuth);

	app.use("/api/v1/auth", authRoutes);
	app.use("/api/v1/rocks", rocksRoutes);
	app.use("/api/v1/users", usersRoutes);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}

module.exports = createApp;
