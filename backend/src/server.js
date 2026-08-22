const mongoose = require("mongoose");

const config = require("./config");
const logger = require("./lib/logger");
const createApp = require("./app");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connect, retrying while the database is still coming up.
 *
 * The database container has no healthcheck compose can wait on, so the API can
 * start first. Retrying here is more honest than letting the process exit and
 * relying on `restart: unless-stopped` to paper over it: a crash loop makes an
 * ordinary cold start look like a fault in the logs.
 *
 * Anything that is not a connectivity failure, a wrong password for instance,
 * still exits immediately. Retrying those would only delay the real message.
 */
async function connectWithRetry() {
	const attempts = Math.max(1, config.DB_CONNECT_RETRIES);

	for (let attempt = 1; ; attempt += 1) {
		try {
			await mongoose.connect(config.MONGODB_URI, {
				serverSelectionTimeoutMS: 5_000,
			});
			return;
		} catch (err) {
			// Mongoose wraps the driver's error and renames it, so this has to
			// match loosely: the driver raises MongoServerSelectionError while
			// mongoose.connect re-throws MongooseServerSelectionError.
			const connectivity = /ServerSelection|Network|Timeout/i.test(
				err.name || ""
			);
			// A wrong password also surfaces as a selection failure, and no
			// amount of waiting will fix it.
			const credentials =
				/authentication failed|not authorized|bad auth/i.test(
					err.message || ""
				);

			if (!connectivity || credentials || attempt >= attempts) {
				throw err;
			}

			const delay = Math.min(1_000 * attempt, 5_000);
			logger.warn(
				{ attempt, attempts, err: err.message },
				"Database not reachable yet, retrying"
			);
			await sleep(delay);
		}
	}
}

async function start() {
	mongoose.set("strictQuery", true);

	await connectWithRetry();
	logger.info("Connected to the database");

	const app = createApp();
	const server = app.listen(config.PORT, () => {
		logger.info(
			{ port: config.PORT, env: config.NODE_ENV },
			"HECTOR API listening"
		);
	});

	// Graceful shutdown: stop accepting connections, let in-flight requests
	// finish, then close the database handle. Without this, `docker compose
	// restart` kills requests mid-write.
	let shuttingDown = false;
	const shutdown = async (signal) => {
		if (shuttingDown) return;
		shuttingDown = true;
		logger.info({ signal }, "Shutting down");

		const forced = setTimeout(() => {
			logger.error("Shutdown timed out, exiting hard");
			process.exit(1);
		}, 10_000);
		forced.unref();

		server.close(async () => {
			await mongoose.connection.close(false);
			logger.info("Shutdown complete");
			process.exit(0);
		});
	};

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
	logger.fatal({ err }, "Failed to start");
	process.exit(1);
});
