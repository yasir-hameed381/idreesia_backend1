const express = require("express");
const controller = require("../../controllers/tabarukat.controller");

const router = express.Router();

// Get all Tabarukat (with pagination + search)
router.route("/").get(controller.getTabarukat);

// Create a new Tabarukat
router.route("/add").post(controller.createTabarukat);

// Delete Tabarukat by ID
router.route("/:id").delete(controller.deleteTabarukat);

// Update Tabarukat by ID
router.route("/update/:id").put(controller.updateTabarukat);

// Get Tabarukat by ID
router.route("/:id").get(controller.getTabarukatById);

module.exports = router;
