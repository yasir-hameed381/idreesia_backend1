const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboard.controller");
// auth middleware is exported as the module's default from authMiddleware.js
const authenticate = require("../../middlewares/authMiddleware");

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard stats with role-based filtering
 * @access  Private
 */
router.get("/stats", authenticate, dashboardController.getDashboardStats);

/**
 * @route   GET /api/v1/dashboard/overall-totals
 * @desc    Get overall totals (not filtered by date)
 * @access  Private
 */
router.get(
  "/overall-totals",
  authenticate,
  dashboardController.getOverallTotals
);

/**
 * @route   GET /api/v1/dashboard/zones
 * @desc    Get zones filtered by user permissions
 * @access  Private
 */
router.get("/zones", authenticate, dashboardController.getZonesForUser);

/**
 * @route   GET /api/v1/dashboard/mehfils/:zone_id
 * @desc    Get mehfils for a specific zone
 * @access  Private
 */
router.get(
  "/mehfils/:zone_id",
  authenticate,
  dashboardController.getMehfilsForZone
);

module.exports = router;

