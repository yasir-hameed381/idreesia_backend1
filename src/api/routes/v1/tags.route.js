const express = require("express");
const controller = require("../../controllers/tags.controller");

const router = express.Router();

router.route("/").get(controller.getTags);
router.route("/:id").get(controller.getTagsById);
router.route("/add").post(controller.createTag);
router.route("/update/:id").put(controller.updateTag);
router.route("/:id").delete(controller.deleteTags);

module.exports = router;
