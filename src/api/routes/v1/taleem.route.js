const express = require("express");
const controller = require("../../controllers/taleem.controller");

const router = express.Router();

router.route("/").get(controller.getTaleem);
router.route("/add").post(controller.createTaleemShareef);
router.route("/:id").delete(controller.removeTaleemShareef);
router.route("/update/:id").put(controller.updateTaleemShareef);


module.exports = router;
