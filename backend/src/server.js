const mongoose = require("mongoose");

const config = require("./config");
const logger = require("./lib/logger");
const createApp = require("./app");

async function start() {
	mongoose.set("strictQuery", true);

	// Fail fast rather than buffering queries forever if mongo is not up yet.
	await mongoose.connect(config.MONGODB_URI, {
		serverSelectionTimeoutMS: 10_000,
	});
	logger.info("Connected to MongoDB");

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
