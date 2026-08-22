// These checks deliberately run with no database connection at all.
//
// If any of them touched mongo the request would hang until mongoose's buffer
// timeout, so passing here proves the auth and validation layers reject bad
// requests *before* any query is issued, which is what keeps an unauthenticated
// flood cheap.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-value-at-least-32-characters-long";
process.env.MONGODB_URI = "mongodb://placeholder/db";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app")();

const ANY_UUID = "11111111-2222-4333-8444-555555555555";

test("mutating endpoints reject anonymous callers with 401", async () => {
	const cases = [
		["post", "/api/v1/rocks"],
		["patch", `/api/v1/rocks/${ANY_UUID}`],
		["delete", `/api/v1/rocks/${ANY_UUID}`],
		["patch", `/api/v1/users/${ANY_UUID}`],
		["delete", `/api/v1/users/${ANY_UUID}`],
		["post", `/api/v1/users/${ANY_UUID}/rocks/${ANY_UUID}`],
		["delete", `/api/v1/users/${ANY_UUID}/rocks/${ANY_UUID}`],
		["get", "/api/v1/auth/me"],
	];

	for (const [method, path] of cases) {
		const res = await request(app)[method](path).send({});
		assert.equal(res.status, 401, `${method.toUpperCase()} ${path}`);
	}
});

test("a session for one user cannot act on another user's routes", async () => {
	const token = jwt.sign({ sub: ANY_UUID }, process.env.JWT_SECRET);
	const otherId = "99999999-2222-4333-8444-555555555555";

	for (const [method, path] of [
		["patch", `/api/v1/users/${otherId}`],
		["delete", `/api/v1/users/${otherId}`],
		["post", `/api/v1/users/${otherId}/rocks/${ANY_UUID}`],
	]) {
		const agent = request(app);
		const res = await agent[method](path)
			.set("Authorization", `Bearer ${token}`)
			.send({});
		assert.equal(res.status, 403, `${method.toUpperCase()} ${path}`);
	}
});

test("a forged or expired token is refused", async () => {
	const forged = jwt.sign({ sub: ANY_UUID }, "not-the-real-signing-secret");
	await request(app)
		.get("/api/v1/auth/me")
		.set("Authorization", `Bearer ${forged}`)
		.expect(401);

	const expired = jwt.sign({ sub: ANY_UUID }, process.env.JWT_SECRET, {
		expiresIn: "-1s",
	});
	await request(app)
		.get("/api/v1/auth/me")
		.set("Authorization", `Bearer ${expired}`)
		.expect(401);
});

test("registration validates before it hits the database", async () => {
	const res = await request(app)
		.post("/api/v1/auth/register")
		.send({ name: "", username: "a", password: "short" })
		.expect(422);

	const fields = [...new Set(res.body.details.map((d) => d.field))].sort();
	assert.deepEqual(fields, ["name", "password", "username"]);
});

test("an unknown route returns a JSON 404, not an HTML error page", async () => {
	const res = await request(app).get("/api/v1/nope").expect(404);
	assert.match(res.headers["content-type"], /application\/json/);
	assert.ok(res.body.message);
});

test("security headers are set and the express fingerprint is gone", async () => {
	const res = await request(app).get("/api/v1/nope");
	assert.equal(res.headers["x-powered-by"], undefined);
	assert.equal(res.headers["x-content-type-options"], "nosniff");
	assert.ok(res.headers["strict-transport-security"]);
});

test("no CORS wildcard is emitted when CORS_ORIGINS is unset", async () => {
	const res = await request(app)
		.get("/api/v1/rocks")
		.set("Origin", "https://evil.example");
	assert.notEqual(res.headers["access-control-allow-origin"], "*");
});

test("healthz reports degraded while the database is down", async () => {
	const res = await request(app).get("/healthz").expect(503);
	assert.equal(res.body.database, "disconnected");
});

test("oversized JSON bodies are rejected", async () => {
	const res = await request(app)
		.post("/api/v1/auth/register")
		.set("Content-Type", "application/json")
		.send(JSON.stringify({ name: "x".repeat(20000) }));
	assert.equal(res.status, 413);
});

test("every API response forbids caching", async () => {
	// A cached API response is a wrong answer with a long life: one browser
	// keeps serving its stale copy of who owns what while another has already
	// changed it, and `public` would let a shared cache hand one visitor's
	// /auth/me to somebody else.
	// These four answer without a query, which is what keeps the file's
	// no-database rule intact: a route that reached mongoose here would sit
	// out the buffer timeout before replying.
	const cases = [
		["get", "/api/v1/auth/me"],
		["post", "/api/v1/rocks"],
		["get", "/api/v1/no-such-route"],
		["get", "/healthz"],
	];

	for (const [method, path] of cases) {
		const res = await request(app)[method](path).send({});
		assert.equal(
			res.headers["cache-control"],
			"no-store",
			`${method.toUpperCase()} ${path} (status ${res.status})`
		);
	}
});
