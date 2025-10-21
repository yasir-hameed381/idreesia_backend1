const express = require("express");
const controller = require("../../controllers/adminUsers.controller");

const router = express.Router();

router.route("/").get(controller.getAdminUsers);
router.route("/add").post(controller.createAdminUser);
router.route("/:id").delete(controller.deleteAdminUser);
router.route("/update/:id").put(controller.updateAdminUser);
router.route("/:id").get(controller.getAdminUserById);
module.exports = router;
