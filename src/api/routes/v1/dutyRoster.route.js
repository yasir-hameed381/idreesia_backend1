const express = require("express");
const controller = require("../../controllers/dutyRoster.controller");

const router = express.Router();

/**
 * @route   GET /api/duty-rosters-data
 * @desc    Get all duty rosters with pagination
 * @access  Private
 */
router.route("/").get(controller.getAllDutyRosters);

/**
 * @route   GET /api/duty-rosters-data/karkun/:ehadKarkunId
 * @desc    Get duty roster by karkun
 * @access  Private
 */
router.route("/karkun/:ehadKarkunId").get(controller.getDutyRosterByKarkun);

/**
 * @route   GET /api/duty-rosters-data/:id
 * @desc    Get a single duty roster by ID
 * @access  Private
 */
router.route("/:id").get(controller.getDutyRosterById);

/**
 * @route   POST /api/duty-rosters-data/add
 * @desc    Create a new duty roster
 * @access  Private
 */
router.route("/add").post(controller.createDutyRoster);

/**
 * @route   PUT /api/duty-rosters-data/update/:id
 * @desc    Update a duty roster
 * @access  Private
 */
router.route("/update/:id").put(controller.updateDutyRoster);


/**
 * @route   DELETE /api/duty-rosters-data/:id
 * @desc    Delete a duty roster
 * @access  Private
 */
router.route("/:id").delete(controller.deleteDutyRoster);

module.exports = router;


