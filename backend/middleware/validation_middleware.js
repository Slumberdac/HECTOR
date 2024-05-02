const { body, oneOf } = require("express-validator");

const userValidationRules = () => {
	return [
		body("name").notEmpty().withMessage("Le nom est requis"),
		body("username")
			.notEmpty()
			.withMessage("Le nom d'utilisateur est requis"),
		body("password")
			.isLength({ min: 8 })
			.withMessage("Le mot de passe doit contenir au moins 8 caractères"),
		body("pfp_eyes")
			.isInt()
			.withMessage("Les yeux doivent être un nombre entier"),
		body("pfp_mouth")
			.isInt()
			.withMessage("La bouche doit être un nombre entier"),
		body("pfp_color")
			.isHexColor()
			.withMessage("La couleur doit être un hexadécimal"),
	];
};

const rocksValidationRules = () => {
	return [
		body("name").notEmpty().withMessage("Le nom est requis"),
		body("personality")
			.notEmpty()
			.withMessage("La personnalité est requise"),
		body("description")
			.isLength({ min: 5 })
			.withMessage("La description doit contenir au moins 5 caractères"),
	];
};

exports.rocksValidationRules = rocksValidationRules;
exports.userValidationRules = userValidationRules;
