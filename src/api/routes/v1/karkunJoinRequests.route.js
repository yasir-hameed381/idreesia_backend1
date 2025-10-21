const express = require("express");
const controller = require("../../controllers/karkunJoinRequests.controller");

const router = express.Router();

router.route("/").get(controller.getKarkunJoinRequests);
router.route("/add").post(controller.createKarkunJoinRequest);
router.route("/:id").delete(controller.deleteKarkunJoinRequest);
router.route("/update/:id").put(controller.updateKarkunJoinRequest);
router.route("/:id").get(controller.getKarkunJoinRequestById);
module.exports = router;
