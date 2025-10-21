const express = require("express");
const controller = require("../../controllers/naat.controller");

const router = express.Router();

router.route("/").get(controller.getNaatShareefs);
router.route("/add").post(controller.createNaatShareef);
router.route("/:id").delete(controller.removeNaatShareef);
router.route("/update/:id").put(controller.updateNaatShareef);


module.exports = router;
