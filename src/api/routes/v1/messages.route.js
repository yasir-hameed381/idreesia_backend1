const express = require("express");
const controller = require("../../controllers/messages.controller");

const router = express.Router();

router.route("/").get(controller.getMessages);
router.get("/:id", controller.getMessageById);
router.post("/add", controller.createMessage);
router.put("/update/:id", controller.updateMessage);
router.delete("/:id", controller.deleteMessage);

module.exports = router;
