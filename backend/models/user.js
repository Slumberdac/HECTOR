const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.UUID,
		default: () => new mongoose.Types.UUID(),
		required: true,
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
		// Valide que la complexité du mot de passe est respectée
		validate: {
			validator: (password) =>
				/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*=])[A-Za-z\d!@#$%^&*=]{8,}$/.test(
					password
				),
			message: "{VALUE} is not a valid password",
		},
	},
	pfp_eyes: {
		type: Number,
		required: false,
		min: 1,
		max: 10,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value",
		},
	},
	pfp_mouth: {
		type: Number,
		required: false,
		min: 1,
		max: 12,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value",
		},
	},
	pfp_color: {
		type: String,
		required: false,
		validate: {
			// Valide que la couleur est un code hexadécimal
			validator: (color) => /^#[0-9A-F]{6}$/i.test(color),
			message: "{VALUE} is not a valid hex color code",
		},
	},
});

module.exports = mongoose.model("User", userSchema);
