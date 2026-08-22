// Test bootstrap.
//
// By default the suite spins up an in-memory MongoDB, so `npm test` works on a
// dev machine with nothing installed. Set TEST_MONGODB_URI to point at a real
// server instead — that is what CI does (a mongo service container) and what
// you can do locally with `docker compose -f docker-compose.test.yml up -d`.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
	process.env.JWT_SECRET || "test-secret-value-at-least-32-characters-long";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://placeholder/db";
process.env.BCRYPT_ROUNDS = "10";

const mongoose = require("mongoose");

let mongod;

/**
 * Connect to a test database.
 *
 * Returns a reason string when no database could be started (an offline or
 * network-restricted machine cannot download the in-memory server's mongod
 * binary). Callers skip rather than fail in that case, so a lack of network is
 * never reported as a broken test suite.
 */
async function startDatabase() {
	if (process.env.TEST_MONGODB_URI) {
		await mongoose.connect(process.env.TEST_MONGODB_URI, {
			serverSelectionTimeoutMS: 10_000,
		});
		return null;
	}
	try {
		const { MongoMemoryServer } = require("mongodb-memory-server");
		mongod = await MongoMemoryServer.create();
		await mongoose.connect(mongod.getUri("hector-test"));
		return null;
	} catch (err) {
		return `no test database available (${err.message.split("\n")[0]}); set TEST_MONGODB_URI to run these`;
	}
}

async function stopDatabase() {
	if (mongoose.connection.readyState === 1) {
		await mongoose.connection.dropDatabase();
	}
	await mongoose.disconnect();
	if (mongod) {
		await mongod.stop();
	}
}

async function resetDatabase() {
	const { collections } = mongoose.connection;
	await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
	// Recreate the unique index on username, which deleteMany leaves intact but
	// a dropDatabase between files would not.
	await mongoose.model("User").syncIndexes();
}

const validUser = (overrides = {}) => ({
	name: "Jacob",
	username: `user_${Math.random().toString(36).slice(2, 8)}`,
	password: "Correct1!horse",
	...overrides,
});

const validRock = (overrides = {}) => ({
	name: "Hector",
	personality: "stoic",
	description: "A very good rock, quiet and dependable.",
	...overrides,
});

/** Pull the session cookie out of a supertest response. */
const sessionCookie = (res) => res.headers["set-cookie"];

module.exports = {
	startDatabase,
	stopDatabase,
	resetDatabase,
	validUser,
	validRock,
	sessionCookie,
};
