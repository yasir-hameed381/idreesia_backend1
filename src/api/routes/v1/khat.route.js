const express = require("express");
const controller = require("../../controllers/khat.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

// Basic CRUD routes
router.route("/").get(controller.getKhats);
router.route("/add").post(controller.createKhat);
router.route("/update/:id").put(controller.updateKhat);
router.route("/:id").get(controller.getKhatById);
router.route("/:id").delete(controller.deleteKhat);
router.route("/:id/status").patch(controller.updateKhatStatus);

// Jawab update route (similar to Laravel's save method)
router.route("/:id/jawab").patch(authMiddleware, controller.updateJawab);

// Question management routes (similar to Laravel KhatView actions)
router.route("/:id/questions").get(controller.getQuestions);
router.route("/:id/questions").post(authMiddleware, controller.addQuestion);
router.route("/:id/questions/send").post(authMiddleware, controller.sendQuestions);
router.route("/questions/:questionId").delete(authMiddleware, controller.deleteQuestion);

// Public link routes
router.route("/generate-public-link").post(
  authMiddleware,
  controller.generatePublicLink
);
router.route("/validate-token/:token").get(controller.validateToken);
router.route("/mark-token-used").post(controller.markTokenAsUsed);
router.route("/:id").get(controller.getKhatById);
router.route("/:id").delete(controller.deleteKhat);
router.route("/:id/status").patch(controller.updateKhatStatus);

module.exports = router;


