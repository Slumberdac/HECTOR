const Rock = require("../models/rock");
const HttpError = require("../util/http-error");
const { validationResult } = require("express-validator");

const getRocks = async (req, res, next) => {
	let rocks;
	try {
		rocks = await Rock.find().exec();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}
	res.json({ rocks: rocks });
};

const getRockById = async (req, res, next) => {
	const rockId = req.params.rid;
	let rock;
	try {
		rock = await Rock.findById(rockId).exec();
	} catch (e) {
		const err = new HttpError("A database error occured", 500);
		return next(err);
	}

	//si le compagnon n'est pas trouvé... erreur 404
	if (!rock) {
		const error = new Error("Companion not found");
		error.code = 404; // Spécifie le code de statut HTTP pour l'erreur
		return next(error); // Déclenche une erreur personnalisée
	}

	res.json({ rock: rock });
};

//POST
const createRock = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		// Format the validation errors to create a more readable string
		const errors = validationErrors
			.array()
			.map((err) => `${err.param}: ${err.msg}`)
			.join(", ");
		return next(
			new HttpError(
				`Invalid payload, please check your information: ${errors}`,
				422
			)
		);
	}

	const { name, gender, personality, description, image } = req.body;

	// Crée un nouvel objet Rock, si l'image n'est pas fournie, elle sera définie sur null
	const createdRock = new Rock({
		name,
		gender: gender ?? "N/A",
		personality,
		description,
		image: image ?? null,
	});

	try {
		await createdRock.save();
	} catch (e) {
		return res.status(500).json({ message: "Cannot create the companion" });
	}
	//201 standard pour créé avec succès
	res.status(201).json({ rock: createdRock });
};

//PATCH
const updateRock = async (req, res, next) => {
	const rockId = req.params.rid;
	try {
		const updatedRock = await Rock.findByIdAndUpdate(rockId, req.body, {
			new: true,
		}).exec();
		if (!updatedRock) {
			return res.status(404).json({ message: "Companion not found" });
		}

		res.status(200).json({ rock: updatedRock });
	} catch (e) {
		res.status(500).json({
			message: "Cannot update the companion",
		});
	}
};

//DELETE
const deleteRock = async (req, res, next) => {
	const rockId = req.params.rid;
	try {
		const deletedRock = await Rock.findByIdAndDelete(rockId).exec();
		if (!deletedRock) {
			return res
				.status(404)
				.json({ meCompanionge: "Companion not found" });
		}
		res.status(200).json({ message: "Companion deleted" });
		companion;
	} catch (e) {
		res.status(500).json({
			message: "Cannot delete the companion",
		});
	}
};

exports.getRocks = getRocks;
exports.getRockById = getRockById;
exports.createRock = createRock;
exports.updateRock = updateRock;
exports.deleteRock = deleteRock;
