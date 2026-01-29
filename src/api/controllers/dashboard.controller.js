const logger = require("../../config/logger");
const dashboardService = require("../services/dashboardService");
const authService = require("../services/authService");

/**
 * Get dashboard stats with role-based filtering
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { selected_month, selected_year, selected_zone_id, selected_mehfil_id } =
      req.query;

    // Get authenticated user ID from middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch full user data with permissions and admin flags
    const user = await authService.getUserWithPermissions(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate required filters
    if (!selected_month || !selected_year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    const filters = {
      selectedMonth: parseInt(selected_month),
      selectedYear: parseInt(selected_year),
      selectedZoneId: selected_zone_id ? parseInt(selected_zone_id) : null,
      selectedMehfilId: selected_mehfil_id
        ? parseInt(selected_mehfil_id)
        : null,
    };

    logger.info("Dashboard controller - Filters received:", {
      selected_month,
      selected_year,
      selected_zone_id,
      selected_mehfil_id,
      parsedFilters: filters,
    });

    const stats = await dashboardService.getDashboardStats(filters, user);

    // Log response including mehfil_directory
    logger.info("Dashboard stats response:", {
      hasEhadKarkuns: 'ehadKarkuns' in stats,
      ehadKarkuns: stats.ehadKarkuns,
      totalKarkuns: stats.totalKarkuns,
      hasMehfilDirectory: 'mehfil_directory' in stats,
      mehfilDirectory: stats.mehfil_directory,
      selectedMehfilId: filters.selectedMehfilId,
      responseKeys: Object.keys(stats),
    });

    return res.json(stats);
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    return next(error);
  }
};

/**
 * Get overall totals (not filtered by date)
 */
exports.getOverallTotals = async (req, res, next) => {
  try {
    const totals = await dashboardService.getOverallTotals();
    return res.json(totals);
  } catch (error) {
    logger.error("Error fetching overall totals:", error);
    return next(error);
  }
};

/**
 * Get zones filtered by user permissions
 */
exports.getZonesForUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch full user data with permissions and admin flags
    const user = await authService.getUserWithPermissions(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const zones = await dashboardService.getZonesForUser(user);

    return res.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    logger.error("Error fetching zones for user:", error);
    return next(error);
  }
};

/**
 * Get mehfils for a specific zone
 */
exports.getMehfilsForZone = async (req, res, next) => {
  try {
    const { zone_id } = req.params;

    logger.info(`getMehfilsForZone controller called with zone_id: ${zone_id}`);

    if (!zone_id) {
      return res.status(400).json({
        success: false,
        message: "Zone ID is required",
      });
    }

    const mehfils = await dashboardService.getMehfilsForZone(
      parseInt(zone_id)
    );

    logger.info(`getMehfilsForZone controller returning ${mehfils.length} mehfils`);

    return res.json({
      success: true,
      data: mehfils,
    });
  } catch (error) {
    logger.error("Error fetching mehfils for zone:", error);
    return next(error);
  }
};

