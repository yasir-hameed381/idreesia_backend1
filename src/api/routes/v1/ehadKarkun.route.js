const express = require("express");
const controller = require("../../controllers/ehadKarkun.controller");

const router = express.Router();

router.route("/").get(controller.getEhadKarkun);
router.route("/add").post(controller.createEhadKarkun);
router.route("/:id").delete(controller.deleteEhadKarkun);
router.route("/update/:id").put(controller.updateEhadKarkun);


module.exports = router;
