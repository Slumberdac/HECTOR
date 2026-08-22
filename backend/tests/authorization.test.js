const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const {
	startDatabase,
	stopDatabase,
	resetDatabase,
	validUser,
	validRock,
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

async function makeUser() {
	const payload = validUser();
	const res = await request(app)
		.post("/api/v1/auth/register")
		.send(payload)
		.expect(201);
	return { id: res.body.user._id, cookie: sessionCookie(res), payload };
}

test("anonymous callers cannot create, edit or delete a rock", async () => {
	await request(app).post("/api/v1/rocks").send(validRock()).expect(401);

	const alice = await makeUser();
	const created = await request(app)
		.post("/api/v1/rocks")
		.set("Cookie", alice.cookie)
		.send(validRock())
		.expect(201);
	const rockId = created.body.rock._id;

	await request(app)
		.patch(`/api/v1/rocks/${rockId}`)
		.send({ name: "hijacked" })
		.expect(401);
	await request(app).delete(`/api/v1/rocks/${rockId}`).expect(401);
});

test("a signed-in user cannot edit or delete someone else's rock", async () => {
	const alice = await makeUser();
	const bob = await makeUser();

	const created = await request(app)
		.post("/api/v1/rocks")
		.set("Cookie", alice.cookie)
		.send(validRock())
		.expect(201);
	const rockId = created.body.rock._id;

	await request(app)
		.patch(`/api/v1/rocks/${rockId}`)
		.set("Cookie", bob.cookie)
		.send({ name: "hijacked" })
		.expect(403);

	await request(app)
		.delete(`/api/v1/rocks/${rockId}`)
		.set("Cookie", bob.cookie)
		.expect(403);

	await request(app)
		.patch(`/api/v1/rocks/${rockId}`)
		.set("Cookie", alice.cookie)
		.send({ name: "renamed" })
		.expect(200);
});

test("a user cannot delete or edit another user's account", async () => {
	const alice = await makeUser();
	const bob = await makeUser();

	await request(app).delete(`/api/v1/users/${alice.id}`).expect(401);

	await request(app)
		.delete(`/api/v1/users/${alice.id}`)
		.set("Cookie", bob.cookie)
		.expect(403);

	await request(app)
		.patch(`/api/v1/users/${alice.id}`)
		.set("Cookie", bob.cookie)
		.send({ name: "Bob was here" })
		.expect(403);

	await request(app)
		.patch(`/api/v1/users/${alice.id}`)
		.set("Cookie", alice.cookie)
		.send({ name: "Alice" })
		.expect(200);
});

test("profile updates ignore fields outside the allow-list", async () => {
	const alice = await makeUser();

	const res = await request(app)
		.patch(`/api/v1/users/${alice.id}`)
		.set("Cookie", alice.cookie)
		.send({
			name: "Alice",
			username: "administrator",
			passwordHash: "$2a$10$forged",
			_id: "00000000-0000-0000-0000-000000000000",
		})
		.expect(200);

	assert.equal(res.body.user.name, "Alice");
	assert.equal(res.body.user.username, alice.payload.username);
	assert.equal(res.body.user._id, alice.id);
});

test("a rock can only be adopted once", async () => {
	const alice = await makeUser();
	const bob = await makeUser();

	const created = await request(app)
		.post("/api/v1/rocks")
		.set("Cookie", alice.cookie)
		.send(validRock())
		.expect(201);
	const rockId = created.body.rock._id;

	await request(app)
		.post(`/api/v1/users/${alice.id}/rocks/${rockId}`)
		.set("Cookie", alice.cookie)
		.expect(201);

	await request(app)
		.post(`/api/v1/users/${bob.id}/rocks/${rockId}`)
		.set("Cookie", bob.cookie)
		.expect(409);

	// And Bob cannot release a rock that is not his.
	await request(app)
		.delete(`/api/v1/users/${bob.id}/rocks/${rockId}`)
		.set("Cookie", bob.cookie)
		.expect(404);
});

test("deleting an account releases its rocks instead of orphaning them", async () => {
	const alice = await makeUser();
	const created = await request(app)
		.post("/api/v1/rocks")
		.set("Cookie", alice.cookie)
		.send(validRock())
		.expect(201);
	const rockId = created.body.rock._id;

	await request(app)
		.post(`/api/v1/users/${alice.id}/rocks/${rockId}`)
		.set("Cookie", alice.cookie)
		.expect(201);

	await request(app)
		.delete(`/api/v1/users/${alice.id}`)
		.set("Cookie", alice.cookie)
		.expect(200);

	const rock = await request(app).get(`/api/v1/rocks/${rockId}`).expect(200);
	assert.equal(rock.body.rock.owner, null);
});

test("malformed ids give 404 rather than a 500", async () => {
	await request(app).get("/api/v1/rocks/not-a-uuid").expect(404);
	await request(app).get("/api/v1/users/not-a-uuid").expect(404);
});

test("a javascript: image URL is rejected", async () => {
	const alice = await makeUser();
	await request(app)
		.post("/api/v1/rocks")
		.set("Cookie", alice.cookie)
		.send(validRock({ image: "javascript:alert(1)" }))
		.expect(422);
});

test("healthz reports the database connection", async () => {
	const res = await request(app).get("/healthz").expect(200);
	assert.equal(res.body.database, "connected");
});
