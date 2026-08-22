const { body, validationResult } = require("express-validator");
const HttpError = require("../util/http-error");

/**
 * Turn accumulated express-validator failures into a single 422.
 *
 * The old controllers each rolled their own version of this, and several of
 * them called `res.status(...).json(...)` *and* `next(err)`, which produced an
 * "headers already sent" crash on every validation failure.
 */
function handleValidation(req, res, next) {
	const result = validationResult(req);
	if (result.isEmpty()) {
		return next();
	}
	const details = result.array().map((e) => ({
		field: e.path,
		message: e.msg,
	}));
	return next(
		HttpError.unprocessable("Please check the submitted fields", details)
	);
}

const registerRules = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Le nom est requis")
		.isLength({ max: 60 })
		.withMessage("Le nom est trop long"),
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Le nom d'utilisateur est requis")
		.isLength({ min: 3, max: 30 })
		.withMessage("Le nom d'utilisateur doit contenir de 3 à 30 caractères")
		.matches(/^[a-zA-Z0-9_.-]+$/)
		.withMessage(
			"Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et soulignés"
		),
	body("password")
		.isLength({ min: 8, max: 128 })
		.withMessage("Le mot de passe doit contenir au moins 8 caractères")
		.matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*=]).*$/)
		.withMessage(
			"Le mot de passe doit contenir une lettre, un chiffre et un caractère spécial (!@#$%^&*=)"
		),
];

const loginRules = [
	body("username").trim().notEmpty().withMessage("Nom d'utilisateur requis"),
	body("password").notEmpty().withMessage("Mot de passe requis"),
];

const updateProfileRules = [
	body("name").optional().trim().notEmpty().isLength({ max: 60 }),
	body("pfp_eyes").optional().isInt({ min: 1, max: 16 }).toInt(),
	body("pfp_mouth").optional().isInt({ min: 1, max: 14 }).toInt(),
	body("pfp_color").optional().isHexColor(),
];

// Built by a factory rather than declared once: express-validator chains are
// mutable, so deriving the "update" variant with `.map(r => r.optional())`
// would also make the create rules optional.
const rockRules = ({ partial = false } = {}) => {
	const opt = (chain) => (partial ? chain.optional() : chain);
	return [
		opt(
			body("name")
				.trim()
				.notEmpty()
				.withMessage("Le nom est requis")
				.isLength({ max: 60 })
		),
		opt(
			body("personality")
				.trim()
				.notEmpty()
				.withMessage("La personnalité est requise")
				.isLength({ max: 120 })
		),
		opt(
			body("description")
				.trim()
				.isLength({ min: 5, max: 2000 })
				.withMessage(
					"La description doit contenir au moins 5 caractères"
				)
		),
		body("gender").optional().trim().isLength({ max: 30 }),
		body("image")
			.optional({ values: "falsy" })
			.isURL({ protocols: ["http", "https"], require_protocol: true })
			.withMessage("L'image doit être une URL http(s) valide"),
	];
};

module.exports = {
	handleValidation,
	registerRules,
	loginRules,
	updateProfileRules,
	rockRules,
};
