const express = require("express");
const controller = require("../../controllers/naat.controller");

const router = express.Router();

router.route("/").get(controller.getNaatShareefs);
router.route("/add").post(controller.createNaatShareef);
router.route("/update/:id").put(controller.updateNaatShareef);
router.route("/:id").get(controller.getNaatShareefById);
router.route("/:id").delete(controller.removeNaatShareef);


module.exports = router;
