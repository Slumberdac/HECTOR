const express = require("express");
const { check } = require("express-validator");
const usersController = require("../controllers/users-controller");
const router = express.Router();

router.get("/", usersController.getUsers);

router.get("/:uid", usersController.getUserById);

router.post(
	"/register",
	[
		check("name").not().isEmpty(),
		check("username").not().isEmpty(),
		check("password").isLength({ min: 8 }),
	],
	usersController.registerUser
);

router.patch("/signin", usersController.signInUser);

router.patch("/:uid", usersController.updateUserById);

router.delete("/:uid", usersController.deleteUserById);

router.get("/:uid/rocks", usersController.getRocksByUser);

router.post("/:uid/rocks/:rid", usersController.addRockToUser);

router.delete("/:uid/rocks/:rid", usersController.removeRockFromUser);

module.exports = router;
