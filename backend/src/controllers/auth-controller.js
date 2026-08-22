const User = require("../models/user");
const HttpError = require("../util/http-error");
const asyncHandler = require("../util/async-handler");
const { issueSession, clearSession } = require("../middleware/auth");

/** Random avatar for a brand new account. */
const randomAvatar = () => ({
	pfp_eyes: Math.floor(Math.random() * 16) + 1,
	pfp_mouth: Math.floor(Math.random() * 14) + 1,
	pfp_color: `#${[0, 0, 0]
		.map(() =>
			Math.floor(Math.random() * (256 - 100) + 100)
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()
		)
		.join("")}`,
});

const register = asyncHandler(async (req, res) => {
	const { name, username, password } = req.body;

	const user = new User({
		name,
		username,
		passwordHash: await User.hashPassword(password),
		...randomAvatar(),
	});

	try {
		await user.save();
	} catch (err) {
		// 11000 is mongo's duplicate-key error on the unique username index.
		if (err.code === 11000) {
			throw HttpError.conflict("That username is already taken");
		}
		throw err;
	}

	issueSession(res, user);
	res.status(201).json({ user: user.toPublicJSON() });
});

const login = asyncHandler(async (req, res) => {
	const { username, password } = req.body;

	// passwordHash is `select: false`, so it has to be asked for explicitly.
	const user = await User.findOne({ username })
		.select("+passwordHash")
		.exec();

	// Deliberately identical response whether the username or the password was
	// wrong: telling them apart lets anyone enumerate valid usernames.
	const ok = user ? await user.verifyPassword(password) : false;
	if (!ok) {
		throw HttpError.unauthorized("Incorrect username or password");
	}

	issueSession(res, user);
	res.status(200).json({ user: user.toPublicJSON() });
});

const logout = asyncHandler(async (req, res) => {
	clearSession(res);
	res.status(204).end();
});

/** Who am I? Used by the frontend to restore a session on page load. */
const me = asyncHandler(async (req, res) => {
	const user = await User.findById(req.userId).exec();
	if (!user) {
		clearSession(res);
		throw HttpError.unauthorized("Session no longer valid");
	}
	res.json({ user: user.toPublicJSON() });
});

module.exports = { register, login, logout, me };
