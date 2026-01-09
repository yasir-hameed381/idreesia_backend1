const express = require("express");
const controller = require("../../controllers/responseTemplates.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(authMiddleware, controller.getResponseTemplates);
router.route("/add").post(authMiddleware, controller.createResponseTemplate);
router.route("/update/:id").put(authMiddleware, controller.updateResponseTemplate);
router.route("/:id").get(authMiddleware, controller.getResponseTemplateById);
router.route("/:id").delete(authMiddleware, controller.deleteResponseTemplate);

module.exports = router;

