#!/usr/bin/env node
/**
 * One-shot migration from the v1 (course project) schema to v2.
 *
 *   npm run migrate:v1 -- --dry-run
 *   npm run migrate:v1
 *
 * Run it against the NEW database, after restoring the old dump into it.
 * It is idempotent: documents already in v2 shape are skipped, so running it
 * twice is harmless.
 *
 * What it does:
 *   users  password (plaintext) -> passwordHash (bcrypt), old field removed
 *   rocks  owner: undefined     -> owner: null
 *   rocks  createdBy backfilled from owner where there is one
 *   both   createdAt/updatedAt backfilled so ordering is stable
 *   both   indexes synced (this is what creates the unique username index)
 *
 * The imported passwords will not all satisfy the v2 complexity rules. That is
 * fine: those rules are enforced at registration, not at login, so migrated
 * accounts can still sign in with whatever they used before.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Reuse the application's own validated configuration rather than a second,
// slightly-different copy of it.
const config = require("../src/config");
const User = require("../src/models/user");
const Rock = require("../src/models/rock");

const DRY_RUN = process.argv.includes("--dry-run") && require.main === module;

// Anything without timestamps predates them; date it to when the course
// project was active so the registry sorts oldest-first sensibly.
const LEGACY_DATE = new Date("2024-05-01T00:00:00Z");

// Quiet under `npm test`, where this is driven by migration.test.js and the
// progress chatter would bury the assertions.
const QUIET = process.env.NODE_ENV === "test";

const log = (...args) => {
	if (QUIET) return;
	console.log(DRY_RUN ? "[dry-run]" : "[migrate]", ...args);
};

async function migrateUsers(users) {
	const legacy = await users.find({ password: { $exists: true } }).toArray();

	log(`users with a plaintext password: ${legacy.length}`);

	let hashed = 0;
	let dropped = 0;

	for (const doc of legacy) {
		// Already migrated and merely carrying the old field along: drop it.
		if (doc.passwordHash) {
			if (!DRY_RUN) {
				await users.updateOne(
					{ _id: doc._id },
					{ $unset: { password: "" } }
				);
			}
			dropped += 1;
			continue;
		}

		const plaintext = String(doc.password ?? "");
		if (!plaintext) {
			log(`  ! ${doc.username}: empty password, skipping (cannot hash)`);
			continue;
		}
		// bcrypt only considers the first 72 bytes of input.
		if (Buffer.byteLength(plaintext) > 72) {
			log(
				`  ! ${doc.username}: password over 72 bytes, will be truncated by bcrypt`
			);
		}

		if (!DRY_RUN) {
			const passwordHash = await bcrypt.hash(
				plaintext,
				config.BCRYPT_ROUNDS
			);
			await users.updateOne(
				{ _id: doc._id },
				{
					$set: {
						passwordHash,
						createdAt: doc.createdAt ?? LEGACY_DATE,
						updatedAt: new Date(),
					},
					$unset: { password: "" },
				}
			);
		}
		hashed += 1;
	}

	log(`  hashed ${hashed}, cleaned up ${dropped} already-migrated`);

	// Backfill timestamps on any user that never had a plaintext password.
	const undated = await users.updateMany(
		{ createdAt: { $exists: false } },
		{ $set: { createdAt: LEGACY_DATE, updatedAt: LEGACY_DATE } },
		{ upsert: false }
	);
	if (!DRY_RUN && undated.modifiedCount) {
		log(`  backfilled timestamps on ${undated.modifiedCount} users`);
	}
}

async function migrateRocks(rocks) {
	// v1 removed an owner with `rock.owner = undefined`, which deletes the key
	// entirely. v2 queries on `owner: null`, and in MongoDB a missing key does
	// match null, but being explicit keeps the documents uniform.
	const unowned = await rocks.countDocuments({ owner: { $exists: false } });
	log(`rocks with no owner key: ${unowned}`);
	if (!DRY_RUN && unowned) {
		await rocks.updateMany(
			{ owner: { $exists: false } },
			{ $set: { owner: null } }
		);
	}

	// Nobody recorded who added a rock in v1. Crediting the current owner is
	// the only defensible guess, and it is what lets them edit their own
	// entries. A rock with neither owner nor creator stays editable by nobody
	// until somebody adopts it, at which point they become its owner and can
	// edit it. That is the intended behaviour, not a gap.
	const orphaned = await rocks.countDocuments({
		createdBy: { $exists: false },
		owner: { $ne: null, $exists: true },
	});
	log(`rocks needing createdBy backfilled from owner: ${orphaned}`);
	if (!DRY_RUN && orphaned) {
		const cursor = rocks.find({
			createdBy: { $exists: false },
			owner: { $ne: null, $exists: true },
		});
		for await (const doc of cursor) {
			await rocks.updateOne(
				{ _id: doc._id },
				{ $set: { createdBy: doc.owner } }
			);
		}
	}

	const undated = await rocks.updateMany(
		{ createdAt: { $exists: false } },
		{ $set: { createdAt: LEGACY_DATE, updatedAt: LEGACY_DATE } }
	);
	if (!DRY_RUN && undated.modifiedCount) {
		log(`  backfilled timestamps on ${undated.modifiedCount} rocks`);
	}
}

async function reportDuplicateUsernames(users) {
	// v2 puts a unique index on username. v1 only did a findOne() check, so a
	// duplicate is possible, and syncIndexes() would fail on it with an
	// unhelpful error. Surface it here instead.
	const duplicates = await users
		.aggregate([
			{ $group: { _id: "$username", n: { $sum: 1 } } },
			{ $match: { n: { $gt: 1 } } },
		])
		.toArray();

	if (duplicates.length) {
		log("! duplicate usernames found; the unique index cannot be built:");
		for (const d of duplicates) {
			log(`    ${d._id} appears ${d.n} times`);
		}
		log("  Resolve these by hand, then re-run.");
		return false;
	}
	return true;
}

/**
 * The migration itself, against an already-open connection. Exported so the
 * test suite can run it on a seeded v1-shape database rather than trusting it
 * on the strength of having been read carefully.
 */
async function migrate() {
	const users = mongoose.connection.collection("users");
	const rocks = mongoose.connection.collection("rocks");

	log(
		`found ${await users.countDocuments()} users, ${await rocks.countDocuments()} rocks`
	);

	const uniqueOk = await reportDuplicateUsernames(users);

	await migrateUsers(users);
	await migrateRocks(rocks);

	if (!DRY_RUN && uniqueOk) {
		log("syncing indexes");
		await User.syncIndexes();
		await Rock.syncIndexes();
	}

	// Verify: nothing should be left holding a plaintext password.
	const remaining = await users.countDocuments({
		password: { $exists: true },
	});
	const unhashed = await users.countDocuments({
		passwordHash: { $exists: false },
	});
	log(`remaining plaintext passwords: ${remaining}`);
	log(`users without a hash: ${unhashed}`);

	if (DRY_RUN) {
		log("nothing was written. Re-run without --dry-run to apply.");
		return { ok: true, dryRun: true };
	}
	if (remaining === 0 && unhashed === 0 && uniqueOk) {
		log("migration complete");
		return { ok: true, dryRun: false };
	}
	log("migration finished with issues, see above");
	return { ok: false, dryRun: false };
}

async function main() {
	log(`connecting to ${config.MONGODB_URI.replace(/\/\/[^@]+@/, "//***@")}`);
	await mongoose.connect(config.MONGODB_URI, {
		serverSelectionTimeoutMS: 10_000,
	});

	const result = await migrate();
	if (!result.ok) {
		process.exitCode = 1;
	}

	await mongoose.disconnect();
}

if (require.main === module) {
	main().catch(async (err) => {
		console.error("[migrate] failed:", err.message);
		await mongoose.disconnect().catch(() => {});
		process.exit(1);
	});
}

module.exports = { migrate };
