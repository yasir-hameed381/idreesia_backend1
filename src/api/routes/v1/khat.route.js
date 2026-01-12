const express = require("express");
const controller = require("../../controllers/khat.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(controller.getKhats);
router.route("/add").post(controller.createKhat);
router.route("/update/:id").put(controller.updateKhat);
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


