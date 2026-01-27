const express = require("express");
const controller = require("../../controllers/parhaiyan.controller");

const router = express.Router();

router.route("/").get(controller.getParhaiyans);
router.route("/active").get(controller.activeParhaiyans);
router.route("/slug/:slug").get(controller.getParhaiyanBySlug);
router.route("/add").post(controller.createParhaiyan);
router.route("/:id").delete(controller.deleteParhaiyan);
router.route("/update/:id").put(controller.updateParhaiyan);


module.exports = router;
