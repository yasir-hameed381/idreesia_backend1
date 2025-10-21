const express = require("express");
const controller = require("../../controllers/mehfilReports.controller");

const router = express.Router();

router.route("/").get(controller.getMehfilReports);
router.route("/add").post(controller.createMehfilReport);
router.route("/update/:id").put(controller.updateMehfilReport);
router.route("/:id").delete(controller.deleteMehfilReport);
router.route("/:id").get(controller.getMehfilReportById);

module.exports = router;
