const express = require("express");
const controller = require("../../controllers/wazaifs.controller");

const router = express.Router();

router.route("/").get(controller.getWazaifs);
router.route("/add").post(controller.createWazaifShareef);
router.route("/:id").delete(controller.removeWazaifShareef);
router.route("/update/:id").put(controller.updateWazaifShareef);


module.exports = router;
