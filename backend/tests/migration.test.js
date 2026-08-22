// Seeds a database in the v1 (course project) shape, runs the migration, and
// checks the thing that actually matters: an imported account can still sign in
// with its original password, and its password is no longer stored in the clear.
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");

const {
	startDatabase,
	stopDatabase,
	resetDatabase,
	sessionCookie,
} = require("./helpers");

const { migrate } = require("../scripts/migrate-from-v1");

let app;
let skipReason = null;

const uuid = (n) => `0000000${n}-1111-4111-8111-222222222222`;

test.before(async () => {
	skipReason = await startDatabase();
	app = require("../src/app")();
});
test.after(async () => stopDatabase());
test.beforeEach(async (t) => {
	if (skipReason) return t.skip(skipReason);
	return resetDatabase();
});

/** Documents exactly as the v1 code wrote them. */
async function seedLegacyData() {
	const users = mongoose.connection.collection("users");
	const rocks = mongoose.connection.collection("rocks");

	await users.insertMany([
		{
			_id: new mongoose.Types.UUID(uuid(1)),
			name: "Jacob",
			username: "slumberdac",
			password: "Rocks4Ever!", // plaintext, as v1 stored it
			pfp_eyes: 4,
			pfp_mouth: 7,
			pfp_color: "#8FCF9A",
		},
		{
			_id: new mongoose.Types.UUID(uuid(2)),
			name: "Sami",
			username: "sami",
			password: "hunter2hunter2",
			pfp_eyes: 11,
			pfp_mouth: 2,
			pfp_color: "#C79ACF",
		},
	]);

	await rocks.insertMany([
		{
			// owned rock
			_id: new mongoose.Types.UUID(uuid(3)),
			name: "Hector",
			gender: "N/A",
			personality: "stoic",
			description: "The original. Quiet, dependable, slightly mossy.",
			owner: new mongoose.Types.UUID(uuid(1)),
		},
		{
			// v1 released a rock with `rock.owner = undefined`, which removes
			// the key entirely rather than setting it to null.
			_id: new mongoose.Types.UUID(uuid(4)),
			name: "Pierrette",
			gender: "she/her",
			personality: "enthusiastic",
			description: "Found by the Lachine canal.",
		},
	]);
}

test("imported accounts can sign in with their original password", async () => {
	await seedLegacyData();
	const result = await migrate();
	assert.equal(result.ok, true);

	const res = await request(app)
		.post("/api/v1/auth/login")
		.send({ username: "slumberdac", password: "Rocks4Ever!" })
		.expect(200);

	assert.equal(res.body.user.username, "slumberdac");
	assert.ok(sessionCookie(res));

	// And the wrong password still fails.
	await request(app)
		.post("/api/v1/auth/login")
		.send({ username: "slumberdac", password: "Rocks4Ever" })
		.expect(401);
});

test("migration removes plaintext passwords and stores bcrypt hashes", async () => {
	await seedLegacyData();
	await migrate();

	const users = mongoose.connection.collection("users");
	assert.equal(
		await users.countDocuments({ password: { $exists: true } }),
		0
	);

	const stored = await users.findOne({ username: "slumberdac" });
	assert.match(stored.passwordHash, /^\$2[aby]\$/);
	assert.notEqual(stored.passwordHash, "Rocks4Ever!");

	// And nothing leaks through the API.
	const registry = await request(app).get("/api/v1/users").expect(200);
	const body = JSON.stringify(registry.body);
	assert.ok(!body.includes("Rocks4Ever"));
	assert.ok(!body.includes("hunter2"));
	assert.ok(!body.includes("passwordHash"));
});

test("migration is idempotent", async () => {
	await seedLegacyData();
	await migrate();

	const users = mongoose.connection.collection("users");
	const first = await users.findOne({ username: "slumberdac" });

	const second = await migrate();
	assert.equal(second.ok, true);

	const after = await users.findOne({ username: "slumberdac" });
	assert.equal(
		after.passwordHash,
		first.passwordHash,
		"a second run must not re-hash an already-hashed password"
	);

	// Login still works after two runs.
	await request(app)
		.post("/api/v1/auth/login")
		.send({ username: "slumberdac", password: "Rocks4Ever!" })
		.expect(200);
});

test("legacy rocks come through adoptable and editable by their owner", async () => {
	await seedLegacyData();
	await migrate();

	const listed = await request(app).get("/api/v1/rocks").expect(200);
	assert.equal(listed.body.rocks.length, 2);

	const pierrette = listed.body.rocks.find((r) => r.name === "Pierrette");
	assert.equal(pierrette.owner, null, "a released rock must read as unowned");

	const hector = listed.body.rocks.find((r) => r.name === "Hector");
	assert.equal(hector.owner, uuid(1));
	assert.equal(
		hector.createdBy,
		uuid(1),
		"createdBy is backfilled from owner so the owner can still edit"
	);

	// The owner can edit their imported rock.
	const login = await request(app)
		.post("/api/v1/auth/login")
		.send({ username: "slumberdac", password: "Rocks4Ever!" })
		.expect(200);

	await request(app)
		.patch(`/api/v1/rocks/${hector._id}`)
		.set("Cookie", sessionCookie(login))
		.send({ description: "Still quiet, still dependable, more moss." })
		.expect(200);

	// And an unowned legacy rock is available to adopt.
	await request(app)
		.post(`/api/v1/users/${uuid(1)}/rocks/${pierrette._id}`)
		.set("Cookie", sessionCookie(login))
		.expect(201);
});

test("the unique username index is built by the migration", async () => {
	await seedLegacyData();
	await migrate();

	const indexes = await mongoose.connection.collection("users").indexes();
	const unique = indexes.find((i) => i.key?.username && i.unique);
	assert.ok(unique, "username must end up with a unique index");
});
