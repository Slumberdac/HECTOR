const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const {
	startDatabase,
	stopDatabase,
	resetDatabase,
	validUser,
	sessionCookie,
} = require("./helpers");

let app;
let skipReason = null;

test.before(async () => {
	skipReason = await startDatabase();
	app = require("../src/app")();
});
test.after(async () => stopDatabase());
test.beforeEach(async (t) => {
	if (skipReason) return t.skip(skipReason);
	return resetDatabase();
});

test("registers a user and never returns the password", async () => {
	const payload = validUser();
	const res = await request(app)
		.post("/api/v1/auth/register")
		.send(payload)
		.expect(201);

	assert.equal(res.body.user.username, payload.username);
	assert.equal(res.body.user.password, undefined);
	assert.equal(res.body.user.passwordHash, undefined);
	assert.ok(
		!JSON.stringify(res.body).includes(payload.password),
		"the plaintext password must not appear anywhere in the response"
	);
	assert.ok(sessionCookie(res), "registration should open a session");
});

test("stores a bcrypt hash rather than the password", async () => {
	const payload = validUser();
	await request(app).post("/api/v1/auth/register").send(payload).expect(201);

	const User = require("../src/models/user");
	const stored = await User.findOne({ username: payload.username })
		.select("+passwordHash")
		.exec();

	assert.notEqual(stored.passwordHash, payload.password);
	assert.match(stored.passwordHash, /^\$2[aby]\$/);
	assert.equal(await stored.verifyPassword(payload.password), true);
	assert.equal(await stored.verifyPassword("wrong-password"), false);
});

test("rejects a weak password with 422 and field details", async () => {
	const res = await request(app)
		.post("/api/v1/auth/register")
		.send(validUser({ password: "short" }))
		.expect(422);

	assert.ok(Array.isArray(res.body.details));
	assert.ok(res.body.details.some((d) => d.field === "password"));
});

test("rejects a duplicate username with 409", async () => {
	const payload = validUser();
	await request(app).post("/api/v1/auth/register").send(payload).expect(201);
	await request(app)
		.post("/api/v1/auth/register")
		.send(validUser({ username: payload.username }))
		.expect(409);
});

test("logs in with correct credentials and rejects wrong ones identically", async () => {
	const payload = validUser();
	await request(app).post("/api/v1/auth/register").send(payload).expect(201);

	await request(app)
		.post("/api/v1/auth/login")
		.send({ username: payload.username, password: payload.password })
		.expect(200);

	const wrongPassword = await request(app)
		.post("/api/v1/auth/login")
		.send({ username: payload.username, password: "Nope1!nope" })
		.expect(401);

	const noSuchUser = await request(app)
		.post("/api/v1/auth/login")
		.send({ username: "does-not-exist", password: "Nope1!nope" })
		.expect(401);

	assert.equal(
		wrongPassword.body.message,
		noSuchUser.body.message,
		"responses must not reveal whether the username exists"
	);
});

test("/auth/me requires a session and returns the current user", async () => {
	await request(app).get("/api/v1/auth/me").expect(401);

	const payload = validUser();
	const reg = await request(app)
		.post("/api/v1/auth/register")
		.send(payload)
		.expect(201);

	const res = await request(app)
		.get("/api/v1/auth/me")
		.set("Cookie", sessionCookie(reg))
		.expect(200);

	assert.equal(res.body.user.username, payload.username);
});

test("the user registry never exposes password material", async () => {
	const payload = validUser();
	await request(app).post("/api/v1/auth/register").send(payload).expect(201);

	const res = await request(app).get("/api/v1/users").expect(200);
	const body = JSON.stringify(res.body);

	assert.ok(!body.includes(payload.password));
	assert.ok(!body.includes("passwordHash"));
	assert.equal(res.body.users[0].password, undefined);
});
