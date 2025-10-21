const express = require("express");
const controller = require("../../controllers/permissions.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(authMiddleware, controller.getPermissions);
// router.route("/add").post(controller.createKarkun);
// // router.route("/:id").delete(controller.deleteEhadKarkun);
// router.route("/update/:id").put(controller.updateKarkun);
// router.route("/:id").delete(controller.deleteKarkun);
module.exports = router;
