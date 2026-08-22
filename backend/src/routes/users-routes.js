const express = require("express");

const usersController = require("../controllers/users-controller");
const { requireAuth, requireSelf } = require("../middleware/auth");
const {
	handleValidation,
	updateProfileRules,
} = require("../middleware/validate");

const router = express.Router();

// Public reads — the registry is meant to be browsable by anyone.
router.get("/", usersController.getUsers);
router.get("/:uid", usersController.getUserById);
router.get("/:uid/rocks", usersController.getRocksByUser);

// Everything below changes state and must be done by the account's owner.
router.patch(
	"/:uid",
	requireAuth,
	requireSelf(),
	updateProfileRules,
	handleValidation,
	usersController.updateUserById
);

router.delete(
	"/:uid",
	requireAuth,
	requireSelf(),
	usersController.deleteUserById
);

router.post(
	"/:uid/rocks/:rid",
	requireAuth,
	requireSelf(),
	usersController.adoptRock
);

router.delete(
	"/:uid/rocks/:rid",
	requireAuth,
	requireSelf(),
	usersController.releaseRock
);

module.exports = router;
