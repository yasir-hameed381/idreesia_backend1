const express = require("express");
const controller = require("../../controllers/namaz.controller");

const router = express.Router();

router.route("/").get(controller.getNamazTimings);
router.route("/add").post(controller.createNamazTiming);
router.route("/:id").delete(controller.deleteNamazTiming);
router.route("/update/:id").put(controller.updateNamazTiming);


module.exports = router;
