const express = require("express");
const controller = require("../../controllers/dutyType.controller");

const router = express.Router();

/**
 * @route   GET /api/duty-types-data
 * @desc    Get all duty types with pagination
 * @access  Private
 */
router.route("/").get(controller.getAllDutyTypes);

/**
 * @route   GET /api/duty-types-data/active
 * @desc    Get all active duty types
 * @access  Private
 */
router.route("/active").get(controller.getActiveDutyTypes);

/**
 * @route   GET /api/duty-types-data/:id
 * @desc    Get a single duty type by ID
 * @access  Private
 */
router.route("/:id").get(controller.getDutyTypeById);

/**
 * @route   POST /api/duty-types-data/add
 * @desc    Create a new duty type
 * @access  Private
 */
router.route("/add").post(controller.createDutyType);

/**
 * @route   PUT /api/duty-types-data/update/:id
 * @desc    Update a duty type
 * @access  Private
 */
router.route("/update/:id").put(controller.updateDutyType);

/**
 * @route   DELETE /api/duty-types-data/:id
 * @desc    Delete a duty type
 * @access  Private
 */
router.route("/:id").delete(controller.deleteDutyType);

module.exports = router;


