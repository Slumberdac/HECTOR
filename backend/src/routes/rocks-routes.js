const express = require("express");

const rocksController = require("../controllers/rocks-controller");
const { requireAuth } = require("../middleware/auth");
const { handleValidation, rockRules } = require("../middleware/validate");

const router = express.Router();

router.get("/", rocksController.getRocks);
router.get("/:rid", rocksController.getRockById);

router.post(
	"/",
	requireAuth,
	rockRules(),
	handleValidation,
	rocksController.createRock
);

router.patch(
	"/:rid",
	requireAuth,
	rockRules({ partial: true }),
	handleValidation,
	rocksController.updateRock
);

router.delete("/:rid", requireAuth, rocksController.deleteRock);

module.exports = router;
