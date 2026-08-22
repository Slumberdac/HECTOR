const User = require("../models/user");
const Rock = require("../models/rock");
const HttpError = require("../util/http-error");
const asyncHandler = require("../util/async-handler");
const { isUuid } = require("../util/uuid");

/** Load a user by id or raise a 404. */
async function findUserOr404(userId) {
	if (!isUuid(userId)) {
		throw HttpError.notFound("User not found");
	}
	const user = await User.findById(userId).exec();
	if (!user) {
		throw HttpError.notFound("User not found");
	}
	return user;
}

const getUsers = asyncHandler(async (req, res) => {
	// Capped and sorted so the registry stays cheap on a Raspberry Pi even if
	// the collection grows.
	const limit = Math.min(Number(req.query.limit) || 100, 200);
	const users = await User.find().sort({ createdAt: 1 }).limit(limit).exec();
	res.json({ users: users.map((u) => u.toPublicJSON()) });
});

const getUserById = asyncHandler(async (req, res) => {
	const user = await findUserOr404(req.params.uid);
	res.json({ user: user.toPublicJSON() });
});

const updateUserById = asyncHandler(async (req, res) => {
	const user = await findUserOr404(req.params.uid);

	// Allow-list of updatable fields. The old handler passed `req.body`
	// straight into findByIdAndUpdate, so a client could rewrite its own
	// username, or its password, or any other field it liked.
	for (const field of ["name", "pfp_eyes", "pfp_mouth", "pfp_color"]) {
		if (req.body[field] !== undefined) {
			user[field] = req.body[field];
		}
	}

	await user.save();
	res.status(200).json({ user: user.toPublicJSON() });
});

const deleteUserById = asyncHandler(async (req, res) => {
	const user = await findUserOr404(req.params.uid);

	// Release the rocks *before* deleting the account, so a failure halfway
	// through cannot leave rocks pointing at a user that no longer exists.
	await Rock.updateMany({ owner: user._id }, { owner: null }).exec();
	await user.deleteOne();

	res.status(200).json({ message: "User deleted" });
});

const getRocksByUser = asyncHandler(async (req, res) => {
	const user = await findUserOr404(req.params.uid);
	const rocks = await Rock.find({ owner: user._id }).exec();
	res.json({ rocks: rocks.map((r) => r.toPublicJSON()) });
});

const adoptRock = asyncHandler(async (req, res) => {
	const { uid, rid } = req.params;
	const user = await findUserOr404(uid);

	if (!isUuid(rid)) {
		throw HttpError.notFound("Companion not found");
	}

	// A conditional update rather than read-then-write: two people clicking
	// adopt on the same rock at the same time can no longer both succeed,
	// because only the first matches `owner: null`.
	const rock = await Rock.findOneAndUpdate(
		{ _id: rid, owner: null },
		{ owner: user._id },
		{ new: true }
	).exec();

	if (!rock) {
		const exists = await Rock.exists({ _id: rid });
		if (!exists) {
			throw HttpError.notFound("Companion not found");
		}
		throw HttpError.conflict(
			"This companion has already found; the way home"
		);
	}

	res.status(201).json({
		message: `${rock.name} found; the way home`,
		rock: rock.toPublicJSON(),
	});
});

const releaseRock = asyncHandler(async (req, res) => {
	const { uid, rid } = req.params;
	const user = await findUserOr404(uid);

	if (!isUuid(rid)) {
		throw HttpError.notFound("Companion not found");
	}

	const rock = await Rock.findOneAndUpdate(
		{ _id: rid, owner: user._id },
		{ owner: null },
		{ new: true }
	).exec();

	if (!rock) {
		const exists = await Rock.exists({ _id: rid });
		if (!exists) {
			throw HttpError.notFound("Companion not found");
		}
		throw HttpError.forbidden("This companion is not yours to release");
	}

	res.status(200).json({
		message: `${rock.name} will find; another way home`,
		rock: rock.toPublicJSON(),
	});
});

module.exports = {
	getUsers,
	getUserById,
	updateUserById,
	deleteUserById,
	getRocksByUser,
	adoptRock,
	releaseRock,
};
