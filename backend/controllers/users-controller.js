// users-controller.js
const User = require("../models/user");
const Rock = require("../models/rock");
const HttpError = require("../util/http-error");
const { validationResult } = require("express-validator");
const { getResponseRock } = require("./rocks-controller");

// Creates a response object for a user with a comprehensive _id
const getResponseUser = (user) => {
	return {
		_id: user._id,
		name: user.name,
		username: user.username,
		password: user.password,
		pfp_eyes: user.pfp_eyes,
		pfp_mouth: user.pfp_mouth,
		pfp_color: user.pfp_color,
	};
};

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	res.json({ users: users.map((user) => getResponseUser(user)) });
};

const getUserById = async (req, res, next) => {
	const userId = req.params.uid;
	let user;
	try {
		user = await User.findById(userId).exec();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	if (!user) {
		const err = new Error("User not found");
		err.code = 404;
		return next(err);
	}

	res.json({ user: getResponseUser(user) });
};

const registerUser = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		// Format the validation errors to create a more readable string
		const errors = validationErrors
			.array()
			.map((err) => `${err.path}: ${err.msg}`)
			.join(", ");
		return next(
			new HttpError(
				`Invalid payload, please check your information: ${errors}`,
				422
			)
		);
	}

	const { name, username, password } = req.body;

	const pfp_eyes = Math.floor(Math.random() * 9) + 1;
	const pfp_mouth = Math.floor(Math.random() * 8) + 1;
	const pfp_color = `#${[0, 0, 0]
		.map(() =>
			Math.floor(Math.random() * (256 - 100) + 100)
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()
		)
		.join("")}`;

	try {
		const existingUser = await User.findOne({
			username: username,
		}).exec();
		if (existingUser) {
			const err = new HttpError(
				"A user with the same name already exists",
				422
			);
			return next(err);
		}
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	const createdUser = new User({
		name,
		username,
		password,
		pfp_eyes,
		pfp_mouth,
		pfp_color,
	});
	try {
		await createdUser.save();
	} catch (e) {
		const err = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(err);
	}

	res.status(201).json({ user: getResponseUser(createdUser) });
};

const signInUser = async (req, res, next) => {
	const { username, password } = req.body;
	let user;
	try {
		user = await User.findOne({ username }).exec();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	if (!user) {
		const err = new HttpError("User not found", 404);
		return next(err);
	}
	if (user.password !== password) {
		const err = new HttpError("Mot de passe incorrect", 401);
		return next(err);
	}
	res.status(200).json({ user: getResponseUser(user) });
};

const updateUserById = async (req, res, next) => {
	const userId = req.params.uid;
	try {
		const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
			new: true,
		}).exec();
		if (!updatedUser) {
			const err = new Error("User not found", 404);
			return next(err);
		}
		res.status(200).json({ user: getResponseUser(updatedUser) });
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
};

const deleteUserById = async (req, res, next) => {
	const userId = req.params.uid;
	try {
		const deletedUser = await User.findByIdAndDelete(userId).exec();
		if (!deletedUser) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json({ message: "User deleted" });
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
};

const getRocksByUser = async (req, res, next) => {
	const userId = req.params.uid;
	let rocks = [];
	try {
		rocks = await Rock.find({ owner: userId }).exec();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	res.json({ rocks: rocks.map((rock) => getResponseRock(rock)) });
};

const addRockToUser = async (req, res, next) => {
	const userId = req.params.uid;
	const rockId = req.params.rid;
	let user;
	let rock;
	try {
		user = await User.findById(userId).select("_id").exec();
		rock = await Rock.findById(rockId).exec();
		user = user.id;
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	if (!user) {
		const err = new Error("User not found");
		err.code = 404;
		return next(err);
	}
	if (!rock) {
		const err = new Error("Companion not found");
		err.code = 404;
		return next(err);
	}
	try {
		if (rock.owner) {
			const err = new HttpError(
				`${rock.name} has already found; the way home`,
				409
			);
			return next(err);
		}
		rock.owner = user;
		await rock.save();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	res.status(201).json({ message: `${rock.name} found; the way home` });
};

const removeRockFromUser = async (req, res, next) => {
	const userId = req.params.uid;
	const rockId = req.params.rid;
	let user;
	let rock;
	try {
		user = await User.findById(userId).select("_id").exec();
		rock = await Rock.findById(rockId).exec();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	if (!user) {
		const err = new Error("User not found");
		err.code = 404;
		return next(err);
	}
	if (!rock) {
		const err = new Error("Companion not found");
		err.code = 404;
		return next(err);
	}
	try {
		rock.owner = undefined;
		await rock.save();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	res.status(200).json({
		message: `${rock.name} will find; another way home`,
	});
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.registerUser = registerUser;
exports.signInUser = signInUser;
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
exports.getRocksByUser = getRocksByUser;
exports.addRockToUser = addRockToUser;
exports.removeRockFromUser = removeRockFromUser;
