const express = require("express");
const controller = require("../../controllers/region.controller");

const router = express.Router();

router.route("/").get(controller.getRegions);
router.route("/add").post(controller.createRegion);
router.route("/update/:id").put(controller.updateRegion);
router.route("/:id").delete(controller.deleteRegion);
router.route("/:id").get(controller.getRegionById);

module.exports = router;

