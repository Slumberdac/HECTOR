const express = require("express");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/auth-controller");
const { requireAuth } = require("../middleware/auth");
const {
	handleValidation,
	registerRules,
	loginRules,
} = require("../middleware/validate");

const router = express.Router();

// Credential endpoints get their own, much tighter budget than the rest of the
// API: this is what stops someone brute-forcing a password over the open
// internet.
const credentialLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: {
		message: "Too many attempts, please try again in a few minutes",
	},
});

router.post(
	"/register",
	credentialLimiter,
	registerRules,
	handleValidation,
	authController.register
);

router.post(
	"/login",
	credentialLimiter,
	loginRules,
	handleValidation,
	authController.login
);

router.post("/logout", authController.logout);

router.get("/me", requireAuth, authController.me);

module.exports = router;
