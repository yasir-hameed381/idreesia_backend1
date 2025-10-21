const express = require("express");
const controller = require("../../controllers/feedback.controller");

const router = express.Router();

router.route("/").get(controller.getFeedback);
router.route("/add").post(controller.createFeedback);
router.route("/:id").delete(controller.deleteFeedback);
router.route("/update/:id").put(controller.updateFeedback);
router.route("/:id").get(controller.getFeedbackById);
module.exports = router;
