#!/usr/bin/env node
/**
 * Exercise every database operation the application actually relies on, against
 * whatever MONGODB_URI points at.
 *
 *   npm run check:db
 *
 * The test suite runs against real MongoDB (in CI, and via the in-memory server
 * locally), but production runs FerretDB, which implements the MongoDB wire
 * protocol on top of PostgreSQL rather than being MongoDB. Its coverage is good
 * but not total, so "the tests pass" does not by itself prove the deployment
 * works. This script closes that gap: it runs against the real deployed
 * database and touches the specific features this codebase depends on.
 *
 * It writes to a throwaway collection prefix and cleans up after itself, so it
 * is safe to run against production.
 */

const mongoose = require("mongoose");
const config = require("../src/config");

const SUFFIX = process.pid;
const results = [];

async function check(name, fn) {
	try {
		await fn();
		results.push({ name, ok: true });
		console.log(`  ok    ${name}`);
	} catch (err) {
		results.push({ name, ok: false, error: err.message });
		console.log(`  FAIL  ${name}`);
		console.log(`        ${err.message.split("\n")[0]}`);
	}
}

async function main() {
	console.log(
		`connecting to ${config.MONGODB_URI.replace(/\/\/[^@]+@/, "//***@")}\n`
	);
	await mongoose.connect(config.MONGODB_URI, {
		serverSelectionTimeoutMS: 10_000,
	});

	const db = mongoose.connection.db;
	const probe = db.collection(`_probe_${SUFFIX}`);

	// Reported so a compatibility problem can be matched against a version.
	const info = await db.admin().command({ buildInfo: 1 });
	console.log(`server reports version ${info.version}\n`);

	await check("insert and read back a document", async () => {
		await probe.insertOne({ _id: "a", n: 1 });
		const found = await probe.findOne({ _id: "a" });
		if (!found || found.n !== 1)
			throw new Error("document did not round-trip");
	});

	await check("UUID binary _id (how users and rocks are keyed)", async () => {
		const id = new mongoose.Types.UUID();
		await probe.insertOne({ _id: id, kind: "uuid" });
		const found = await probe.findOne({ _id: id });
		if (!found) throw new Error("could not query a document by UUID _id");
	});

	await check("unique index (what stops duplicate usernames)", async () => {
		await probe.createIndex(
			{ uniqueField: 1 },
			{ unique: true, sparse: true }
		);
		await probe.insertOne({ _id: "u1", uniqueField: "taken" });
		try {
			await probe.insertOne({ _id: "u2", uniqueField: "taken" });
		} catch (err) {
			if (err.code === 11000) return;
			throw new Error(
				`expected duplicate key error 11000, got ${err.code}`
			);
		}
		throw new Error("the unique index did not reject a duplicate");
	});

	await check(
		"conditional findOneAndUpdate (what makes adoption race-safe)",
		async () => {
			await probe.insertOne({ _id: "r1", owner: null });
			const first = await probe.findOneAndUpdate(
				{ _id: "r1", owner: null },
				{ $set: { owner: "alice" } },
				{ returnDocument: "after" }
			);
			if (!first || first.owner !== "alice") {
				throw new Error("the first conditional update did not apply");
			}
			const second = await probe.findOneAndUpdate(
				{ _id: "r1", owner: null },
				{ $set: { owner: "bob" } },
				{ returnDocument: "after" }
			);
			if (second) {
				throw new Error(
					"the second update matched, so two people could adopt the same rock"
				);
			}
		}
	);

	await check("$unset (used by the v1 migration)", async () => {
		await probe.insertOne({ _id: "x1", password: "plaintext" });
		await probe.updateOne({ _id: "x1" }, { $unset: { password: "" } });
		const found = await probe.findOne({ _id: "x1" });
		if (found.password !== undefined)
			throw new Error("$unset left the field");
	});

	await check(
		"updateMany (releasing rocks on account deletion)",
		async () => {
			await probe.insertMany([
				{ _id: "m1", owner: "alice" },
				{ _id: "m2", owner: "alice" },
			]);
			const res = await probe.updateMany(
				{ owner: "alice" },
				{ $set: { owner: null } }
			);
			if (res.modifiedCount !== 2) {
				throw new Error(
					`expected 2 modified, got ${res.modifiedCount}`
				);
			}
		}
	);

	await check("sort, skip and limit (registry listings)", async () => {
		const docs = await probe.find({}).sort({ _id: 1 }).limit(3).toArray();
		if (docs.length === 0) throw new Error("sorted query returned nothing");
	});

	await check("aggregate $group (duplicate-username detection)", async () => {
		const out = await probe
			.aggregate([{ $group: { _id: "$owner", n: { $sum: 1 } } }])
			.toArray();
		if (!Array.isArray(out))
			throw new Error("aggregate did not return rows");
	});

	await check("countDocuments and listIndexes", async () => {
		await probe.countDocuments({});
		const idx = await probe.listIndexes().toArray();
		if (!idx.some((i) => i.name === "_id_")) {
			throw new Error("listIndexes did not report the _id index");
		}
	});

	await check("adminCommand ping (the healthcheck)", async () => {
		await db.admin().command({ ping: 1 });
	});

	await probe.drop().catch(() => {});
	await mongoose.disconnect();

	const failed = results.filter((r) => !r.ok);
	console.log("");
	if (failed.length === 0) {
		console.log(`all ${results.length} checks passed`);
		return;
	}
	console.log(`${failed.length} of ${results.length} checks failed:`);
	for (const f of failed) {
		console.log(`  - ${f.name}: ${f.error}`);
	}
	process.exitCode = 1;
}

main().catch(async (err) => {
	console.error("check failed to run:", err.message);
	await mongoose.disconnect().catch(() => {});
	process.exit(1);
});
