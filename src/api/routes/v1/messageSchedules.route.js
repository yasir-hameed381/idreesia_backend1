const express = require("express");
const controller = require("../../controllers/messageSchedules.controller");

const router = express.Router();

router.route("/").get(controller.getMessageSchedules).post(controller.createMessageSchedule);
router.get("/:id", controller.getMessageScheduleById);
router.put("/update/:id", controller.updateMessageSchedule);
router.delete("/:id", controller.deleteMessageSchedule);

module.exports = router;
