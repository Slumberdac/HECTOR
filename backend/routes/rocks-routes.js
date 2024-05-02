const express = require("express");
const { check } = require("express-validator");
const rocksController = require("../controllers/rocks-controller");
const router = express.Router();

// Middleware pour obtenir toutes les roches
router.get("/", rocksController.getRocks);

router.get("/:rid", rocksController.getRockById);

router.post(
	"/",
	[
		check("name").not().isEmpty(),
		check("personality").not().isEmpty(),
		check("description").isLength({ min: 5 }),
	],
	rocksController.createRock
);

router.patch("/:rid", rocksController.updateRock);

router.delete("/:rid", rocksController.deleteRock);

module.exports = router;
