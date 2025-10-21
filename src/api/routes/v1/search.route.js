const express = require("express");
const controller = require("../../controllers/search.controller");

const router = express.Router();

router.route("/").get(controller.search);


module.exports = router;
