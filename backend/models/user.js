const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.UUID,
	},
	name: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
		// Valide que le mot de passe contient au moins 8 caractères, au moins une lettre, au moins un chiffre, et au moins un caractère spécial, et ne contient pas d'espaces
		validate: {
			validator: (password) =>
				/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
					password
				),
			message: "{VALUE} is not a valid password",
		},
	},
	pfp_eyes: {
		type: Number,
		required: true,
		min: 1,
		max: 9,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value",
		},
	},
	pfp_mouth: {
		type: Number,
		required: true,
		min: 1,
		max: 8,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value",
		},
	},
	pfp_color: {
		type: String,
		required: true,
		validate: {
			// Valide que la couleur est un code hexadécimal
			validator: (color) => /^#[0-9A-F]{6}$/i.test(color),
			message: "{VALUE} is not a valid hex color code",
		},
	},
});

module.exports = mongoose.model("User", userSchema);
