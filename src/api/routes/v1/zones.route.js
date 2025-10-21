const express = require("express");
const controller = require("../../controllers/zone.controller");

const router = express.Router();

router.route("/").get(controller.getZones);
router.route("/add").post(controller.createZone);
router.route("/update/:id").put(controller.updateZone);
router.route("/:id").delete(controller.deleteZone);
router.route("/:id").get(controller.getZoneById);

// PDF routes
router.route("/:id/pdf/data").get(controller.getZoneForPdf);
router.route("/:id/pdf/download").get(controller.downloadZonePdf);

module.exports = router;
