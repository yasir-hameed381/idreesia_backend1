const express = require("express");
const controller = require("../../controllers/mehfilCoordinator.controller");

const router = express.Router();

/**
 * @route   GET /api/mehfil-coordinators
 * @desc    Get all coordinators with pagination
 * @access  Private
 */
router.route("/").get(controller.getAllCoordinators);

/**
 * @route   GET /api/mehfil-coordinators/active/:mehfilDirectoryId
 * @desc    Get active coordinators for a mehfil
 * @access  Private
 */
router.route("/active/:mehfilDirectoryId").get(controller.getActiveCoordinatorsByMehfil);

/**
 * @route   GET /api/mehfil-coordinators/:id
 * @desc    Get a single coordinator by ID
 * @access  Private
 */
router.route("/:id").get(controller.getCoordinatorById);

/**
 * @route   POST /api/mehfil-coordinators/add
 * @desc    Create a new coordinator
 * @access  Private
 */
router.route("/add").post(controller.createCoordinator);

/**
 * @route   PUT /api/mehfil-coordinators/update/:id
 * @desc    Update a coordinator
 * @access  Private
 */
router.route("/update/:id").put(controller.updateCoordinator);

/**
 * @route   DELETE /api/mehfil-coordinators/:id
 * @desc    Delete a coordinator
 * @access  Private
 */
router.route("/:id").delete(controller.deleteCoordinator);

module.exports = router;


