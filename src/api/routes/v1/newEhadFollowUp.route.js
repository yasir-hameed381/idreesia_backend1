const express = require("express");
const controller = require("../../controllers/newEhadFollowUp.controller");

const router = express.Router();

/**
 * @route   GET /api/new-ehad-follow-ups
 * @desc    Get all follow-ups with pagination
 * @access  Private
 */
router.route("/").get(controller.getAllFollowUps);

/**
 * @route   GET /api/new-ehad-follow-ups/new-ehad/:newEhadId
 * @desc    Get all follow-ups for a specific new ehad
 * @access  Private
 */
router.route("/new-ehad/:newEhadId").get(controller.getFollowUpsByNewEhad);

/**
 * @route   GET /api/new-ehad-follow-ups/:id
 * @desc    Get a single follow-up by ID
 * @access  Private
 */
router.route("/:id").get(controller.getFollowUpById);

/**
 * @route   POST /api/new-ehad-follow-ups/add
 * @desc    Create a new follow-up
 * @access  Private
 */
router.route("/add").post(controller.createFollowUp);

/**
 * @route   PUT /api/new-ehad-follow-ups/update/:id
 * @desc    Update a follow-up
 * @access  Private
 */
router.route("/update/:id").put(controller.updateFollowUp);

/**
 * @route   DELETE /api/new-ehad-follow-ups/:id
 * @desc    Delete a follow-up
 * @access  Private
 */
router.route("/:id").delete(controller.deleteFollowUp);

module.exports = router;


