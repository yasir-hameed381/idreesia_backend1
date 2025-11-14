const express = require("express");
const controller = require("../../controllers/khat.controller");

const router = express.Router();

router.route("/").get(controller.getKhats);
router.route("/add").post(controller.createKhat);
router.route("/update/:id").put(controller.updateKhat);
router.route("/:id").get(controller.getKhatById);
router.route("/:id").delete(controller.deleteKhat);
router.route("/:id/status").patch(controller.updateKhatStatus);

module.exports = router;


