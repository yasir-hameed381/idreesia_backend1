const express = require("express");
const controller = require("../../controllers/newKarkun.controller");

const router = express.Router();

// Get all new karkuns (with pagination + search)
router.route("/").get(controller.getKarkuns);
    
// Create a new karkun
router.route("/add").post(controller.createKarkun);

// Delete karkun by ID
router.route("/:id").delete(controller.deleteKarkun);

// Update karkun by ID
router.route("/update/:id").put(controller.updateKarkun);

// Get kakrun by ID
router.route("/:id").get(controller.getKarkunById);

module.exports = router;
