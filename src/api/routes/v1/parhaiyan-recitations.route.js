const express = require("express");
const controller = require("../../controllers/parhaiyan_recitations.controller");

const router = express.Router();

router.route("/").get(controller.getParhaiyanRecitations);
router.route("/add").post(controller.addParhaiyanRecitation);
// router.route("/:id").delete(controller.deleteParhaiyan);
// router.route("/update/:id").put(controller.updateParhaiyan);


module.exports = router;
