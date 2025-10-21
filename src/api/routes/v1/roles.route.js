const express = require("express");
const controller = require("../../controllers/roles.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(authMiddleware, controller.getRoles);
router.route("/add").post(authMiddleware, controller.createRole);
router.route("/:id").get(authMiddleware, controller.getRoleById);
router.route("/:id").delete(authMiddleware, controller.deleteRole);
router.route("/update/:id").put(authMiddleware, controller.updateRole);
// router.route("/:id").delete(controller.deleteKarkun);
module.exports = router;
