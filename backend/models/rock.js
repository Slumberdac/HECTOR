const mongoose = require("mongoose");

const rockSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.UUID,
		default: () => new mongoose.Types.UUID(),
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	gender: {
		type: String,
		required: false,
		default: "N/A",
	},
	personality: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: false,
		validate: {
			// Valide que l'image est une URL
			validator: (url) => {
				try {
					new URL(url);
					return true;
				} catch (e) {
					return false;
				}
			},
			message: "{VALUE} is not a valid URL",
		},
	},
	owner: {
		type: mongoose.Schema.Types.UUID,
		required: false,
		ref: "User",
	},
});

module.exports = mongoose.model("Rock", rockSchema);
