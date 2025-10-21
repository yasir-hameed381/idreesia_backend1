const express = require("express");
const controller = require("../../controllers/mehfils.controller");

const router = express.Router();

router.route("/").get(controller.getMehfils);
router.route("/add").post(controller.createMahfil);
router.route("/:id").delete(controller.removeMehfil);
router.route("/update/:id").put(controller.updateMehfil);


module.exports = router;
