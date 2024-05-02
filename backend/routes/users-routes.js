const express = require("express");
const { check } = require("express-validator");
const usersController = require("../controllers/users-controller");
const router = express.Router();

// Middleware pour obtenir toutes les jeus
//liste de users
router.get("/", usersController.getUsers);

router.get("/:uid", usersController.getUserById);

router.post(
	"/",
	[
		check("name").not().isEmpty(),
		check("username").not().isEmpty(),
		check("password").isLength({ min: 8 }),
		check("pfp_eyes").isInt(),
		check("pfp_mouth").isInt(),
		check("pfp_color").isHexColor(),
	],
	usersController.registerUser
);

router.patch("/", usersController.signInUser);

router.patch("/:uid", usersController.updateUserById);

router.delete("/:uid", usersController.deleteUserById);

router.get("/:uid/rocks", usersController.getRocksByUser);

router.post("/:uid/rocks/:rid", usersController.addRockToUser);

router.delete("/:uid/rocks/:rid", usersController.removeRockFromUser);

module.exports = router;
