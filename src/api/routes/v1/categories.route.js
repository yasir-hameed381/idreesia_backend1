const express = require("express");
const controller = require("../../controllers/categories.controller");

const router = express.Router();

router.route("/").get(controller.getCategories);
router.route("/add").post(controller.createCategory);
router.route("/:id").delete(controller.deleteCategory);
router.route("/update/:id").put(controller.updateCategory);


module.exports = router;
