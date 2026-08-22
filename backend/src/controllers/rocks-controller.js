const Rock = require("../models/rock");
const HttpError = require("../util/http-error");
const asyncHandler = require("../util/async-handler");
const { isUuid } = require("../util/uuid");

async function findRockOr404(rockId) {
	if (!isUuid(rockId)) {
		throw HttpError.notFound("Companion not found");
	}
	const rock = await Rock.findById(rockId).exec();
	if (!rock) {
		throw HttpError.notFound("Companion not found");
	}
	return rock;
}

/**
 * A rock may be changed by whoever added it, or by whoever currently has it.
 * Before this check, any anonymous caller could edit or delete any rock.
 */
function assertMayModify(rock, userId) {
	const createdBy = rock.createdBy ? String(rock.createdBy) : null;
	const owner = rock.owner ? String(rock.owner) : null;
	if (userId && (userId === createdBy || userId === owner)) {
		return;
	}
	throw HttpError.forbidden("This companion is not yours to change");
}

const getRocks = asyncHandler(async (req, res) => {
	const limit = Math.min(Number(req.query.limit) || 200, 500);
	const filter = {};
	// `?available=true` powers the "free rocks before adopted rocks" listing
	// without the frontend having to pull the whole collection.
	if (req.query.available === "true") {
		filter.owner = null;
	}
	const rocks = await Rock.find(filter)
		.sort({ owner: 1, createdAt: 1 })
		.limit(limit)
		.exec();
	res.json({ rocks: rocks.map((r) => r.toPublicJSON()) });
});

const getRockById = asyncHandler(async (req, res) => {
	const rock = await findRockOr404(req.params.rid);
	res.json({ rock: rock.toPublicJSON() });
});

const createRock = asyncHandler(async (req, res) => {
	const { name, gender, personality, description, image } = req.body;

	const rock = new Rock({
		name,
		gender: gender || "N/A",
		personality,
		description,
		image: image || undefined,
		createdBy: req.userId,
	});

	await rock.save();
	res.status(201).json({ rock: rock.toPublicJSON() });
});

const updateRock = asyncHandler(async (req, res) => {
	const rock = await findRockOr404(req.params.rid);
	assertMayModify(rock, req.userId);

	// Allow-list again: `owner` and `createdBy` are not client-writable, so a
	// rock cannot be silently reassigned through the update endpoint.
	for (const field of [
		"name",
		"gender",
		"personality",
		"description",
		"image",
	]) {
		if (req.body[field] !== undefined) {
			rock[field] = req.body[field];
		}
	}

	await rock.save();
	res.status(200).json({ rock: rock.toPublicJSON() });
});

const deleteRock = asyncHandler(async (req, res) => {
	const rock = await findRockOr404(req.params.rid);
	assertMayModify(rock, req.userId);
	await rock.deleteOne();
	res.status(200).json({ message: "Companion deleted" });
});

module.exports = {
	getRocks,
	getRockById,
	createRock,
	updateRock,
	deleteRock,
};
