const express = require("express");
const controller = require("../../controllers/auth.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.route("/login").post(controller.login);
router.route("/register").post(controller.register);
router.route("/user").get(authMiddleware, controller.getCurrentUser);

module.exports = router;
