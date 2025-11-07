const express = require("express");
const controller = require("../../controllers/tarteebRequests.controller");

const router = express.Router();

router.route("/").get(controller.getTarteebRequests);
router.route("/add").post(controller.createTarteebRequest);
router.route("/update/:id").put(controller.updateTarteebRequest);
router.route("/:id").get(controller.getTarteebRequestById);
router.route("/:id").delete(controller.deleteTarteebRequest);

module.exports = router;

