const mongoose = require("mongoose");

const rockSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.UUID,
			default: () => new mongoose.Types.UUID(),
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 60,
		},
		gender: {
			type: String,
			default: "N/A",
			trim: true,
			maxlength: 30,
		},
		personality: {
			type: String,
			required: true,
			trim: true,
			maxlength: 120,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			maxlength: 2000,
		},
		image: {
			type: String,
			validate: {
				// Only http(s) URLs. The old validator accepted anything the
				// URL constructor could parse, including `javascript:`, which
				// the frontend then dropped straight into an <img src>.
				validator: (url) => {
					try {
						const parsed = new URL(url);
						return (
							parsed.protocol === "http:" ||
							parsed.protocol === "https:"
						);
					} catch {
						return false;
					}
				},
				message: "{VALUE} is not a valid http(s) URL",
			},
		},
		owner: {
			type: mongoose.Schema.Types.UUID,
			default: null,
			ref: "User",
			index: true,
		},
		// Who created the entry. Only this person (or the rock's owner) may
		// edit or delete it.
		createdBy: {
			type: mongoose.Schema.Types.UUID,
			ref: "User",
			index: true,
		},
	},
	{ timestamps: true }
);

rockSchema.methods.toPublicJSON = function toPublicJSON() {
	return {
		_id: String(this._id),
		name: this.name,
		gender: this.gender,
		personality: this.personality,
		description: this.description,
		image: this.image,
		owner: this.owner ? String(this.owner) : null,
		createdBy: this.createdBy ? String(this.createdBy) : null,
	};
};

module.exports = mongoose.model("Rock", rockSchema);
