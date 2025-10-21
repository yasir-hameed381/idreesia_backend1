const express = require("express");
const controller = require("../../controllers/mehfil-directories.controller");

const router = express.Router();

router.route("/").get(controller.getMehfilDirections);
router.route("/add").post(controller.createMehfilDirection);
router.route("/update/:id").put(controller.updateMehfilDirection);
router.route("/:id").delete(controller.deleteMehfilDirection);
router.route("/:id").get(controller.getDirectionById);


module.exports = router;
