const pino = require("pino");
const config = require("../config");

// Pretty, human-readable logs in development; single-line JSON in production so
// `docker logs` output can be shipped or grepped by machine.
const logger = pino({
	level: config.isTest ? "silent" : config.LOG_LEVEL,
	transport: config.isProduction
		? undefined
		: {
				target: "pino-pretty",
				options: { colorize: true, translateTime: "HH:MM:ss" },
			},
	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers.cookie",
			"res.headers['set-cookie']",
			"*.password",
		],
		remove: true,
	},
});

module.exports = logger;
