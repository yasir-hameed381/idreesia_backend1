const express = require("express");
const controller = require("../../controllers/karkun.controller");

const router = express.Router();

router.route("/").get(controller.getKarkun);
router.route("/add").post(controller.createKarkun);
router.route("/:id").delete(controller.deleteKarkun);
router.route("/update/:id").put(controller.updateKarkun);
router.route("/:id").get(controller.getKarkunById);
module.exports = router;
