const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config");

const userSchema = new mongoose.Schema(
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
		username: {
			type: String,
			required: true,
			trim: true,
			maxlength: 30,
			// A unique index is what actually prevents duplicate usernames.
			// The old code only did a findOne() check first, which loses the
			// race when two registrations arrive at the same moment.
			unique: true,
			index: true,
		},
		// bcrypt hash, never the password itself. `select: false` keeps it out
		// of every query result unless a caller explicitly asks for it, so it
		// cannot be leaked into a response by accident.
		passwordHash: {
			type: String,
			required: true,
			select: false,
		},
		pfp_eyes: {
			type: Number,
			min: 1,
			max: 16,
			validate: {
				validator: Number.isInteger,
				message: "{VALUE} is not an integer value",
			},
		},
		pfp_mouth: {
			type: Number,
			min: 1,
			max: 14,
			validate: {
				validator: Number.isInteger,
				message: "{VALUE} is not an integer value",
			},
		},
		pfp_color: {
			type: String,
			validate: {
				validator: (color) => /^#[0-9A-F]{6}$/i.test(color),
				message: "{VALUE} is not a valid hex color code",
			},
		},
	},
	{ timestamps: true }
);

/** Hash a plaintext password. */
userSchema.statics.hashPassword = function hashPassword(plaintext) {
	return bcrypt.hash(plaintext, config.BCRYPT_ROUNDS);
};

/** Constant-time comparison of a candidate password against the stored hash. */
userSchema.methods.verifyPassword = function verifyPassword(candidate) {
	if (!this.passwordHash) {
		throw new Error(
			"verifyPassword called on a user loaded without passwordHash"
		);
	}
	return bcrypt.compare(candidate, this.passwordHash);
};

/**
 * The public shape of a user. Every response goes through this, which is the
 * single place that decides what the outside world may see.
 */
userSchema.methods.toPublicJSON = function toPublicJSON() {
	return {
		_id: String(this._id),
		name: this.name,
		username: this.username,
		pfp_eyes: this.pfp_eyes,
		pfp_mouth: this.pfp_mouth,
		pfp_color: this.pfp_color,
	};
};

module.exports = mongoose.model("User", userSchema);
