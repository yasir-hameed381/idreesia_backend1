const logger = require("../../config/logger");
const { Op, fn, col, literal } = require("sequelize");
const { sequelize: db } = require("../../config/database");

// Models
const userModel = require("../models/user-admin")(db);
const zonesModel = require("../models/zone")(db);
const mehfilDirectoryModel = require("../models/mehfil-directories")(db);
const mehfilReportsModel = require("../models/mehfilReports")(db);
const newEhadModel = require("../models/newEhadKarkun")(db);
const tabarukatModel = require("../models/tabarukat")(db);

/**
 * Get zones filtered by user permissions (similar to Laravel's Zone::forUser())
 */
const getZonesForUser = async (user) => {
  try {
    let where = {};

    logger.info("Getting zones for user:", {
      is_super_admin: user.is_super_admin,
      is_super_admin_type: typeof user.is_super_admin,
      is_all_region_admin: user.is_all_region_admin,
      is_all_region_admin_type: typeof user.is_all_region_admin,
      is_region_admin: user.is_region_admin,
      is_zone_admin: user.is_zone_admin,
      region_id: user.region_id,
      zone_id: user.zone_id,
    });

    // Matching Laravel Zone::forUser() - only is_all_region_admin gets all zones
    // Super admin does NOT get all zones automatically - they still need is_all_region_admin
    if (user.is_all_region_admin === true) {
      // No filter - return all zones (matching Laravel)
      logger.info("User has access to all zones (is_all_region_admin)");
      // Explicitly set where to empty to return all zones
      where = {};
    }
    // Region admin - can see zones in their region (matching Laravel)
    else if (user.is_region_admin === true && user.region_id) {
      where.region_id = user.region_id;
      logger.info(`Filtering zones by region_id: ${user.region_id}`);
    }
    // Zone admin - can only see their own zone (matching Laravel)
    else if (user.is_zone_admin === true && user.zone_id) {
      where.id = user.zone_id;
      logger.info(`Filtering zones by zone_id (zone admin): ${user.zone_id}`);
    }
    // Mehfil admin or regular user (including super_admin) - can only see their zone (matching Laravel)
    else if (user.zone_id) {
      where.id = user.zone_id;
      logger.info(`Filtering zones by zone_id (regular user/super_admin): ${user.zone_id}`);
    } else {
      // No access
      logger.info("No zone_id found, returning empty array");
      return [];
    }

    logger.info("Final where clause for zones query:", JSON.stringify(where));
    logger.info("Where object keys count:", Object.keys(where).length);

    // Build query options
    const queryOptions = {
      order: [["title_en", "ASC"]],
      attributes: ["id", "title_en", "city_en", "country_en", "region_id"],
    };

    // Only add where clause if it has filters (not empty object)
    // Empty where object means return all zones (for super_admin/all_region_admin)
    if (Object.keys(where).length > 0) {
      queryOptions.where = where;
    }

    const zones = await zonesModel.findAll(queryOptions);

    logger.info(`Found ${zones.length} zones for user`);

    return zones;
  } catch (error) {
    logger.error("Error fetching zones for user:", error);
    throw error;
  }
};

/**
 * Get mehfils filtered by zone and published status
 */
const getMehfilsForZone = async (zoneId) => {
  try {
    if (!zoneId) {
      logger.info("getMehfilsForZone: No zoneId provided, returning empty array");
      return [];
    }

    logger.info(`getMehfilsForZone: Fetching mehfils for zone_id: ${zoneId}`);

    const mehfils = await mehfilDirectoryModel.findAll({
      where: {
        zone_id: zoneId,
        is_published: 1,
      },
      order: [["mehfil_number", "ASC"]],
      attributes: [
        "id",
        "mehfil_number",
        "name_en",
        "address_en",
        "zimdar_bhai",
        "zimdar_bhai_phone_number",
      ],
    });

    logger.info(`getMehfilsForZone: Found ${mehfils.length} mehfils for zone ${zoneId}`);
    
    return mehfils;
  } catch (error) {
    logger.error("Error fetching mehfils for zone:", error);
    throw error;
  }
};

/**
 * Calculate basic stats (Karkuns, Ehad Karkuns, New Ehads, Tabarukats)
 */
const calculateBasicStats = async (filters) => {
  try {
    const { selectedMonth, selectedYear, selectedZoneId, selectedMehfilId } =
      filters;

    // Base query conditions
    const userWhere = { is_super_admin: false };
    const newEhadWhere = {};
    const tabarukatWhere = {};

    // Apply zone filter
    if (selectedZoneId) {
      userWhere.zone_id = selectedZoneId;
      newEhadWhere.zone_id = selectedZoneId;
      tabarukatWhere.zone_id = selectedZoneId;
    }

    // Apply mehfil filter
    if (selectedMehfilId) {
      userWhere.mehfil_directory_id = selectedMehfilId;
      newEhadWhere.mehfil_directory_id = selectedMehfilId;
      tabarukatWhere.mehfil_directory_id = selectedMehfilId;
    }

    // Total Karkuns
    const totalKarkuns = await userModel.count({
      where: { ...userWhere, user_type: "Karkun" },
    });

    // Ehad Karkuns
    const ehadKarkuns = await userModel.count({
      where: { ...userWhere, user_type: "EhadKarkun" },
    });

    // New Ehads (filtered by month/year)
    const totalNewEhads = await newEhadModel.count({
      where: {
        ...newEhadWhere,
        [Op.and]: [
          literal(`MONTH(created_at) = ${selectedMonth}`),
          literal(`YEAR(created_at) = ${selectedYear}`),
        ],
      },
    });

    // Tabarukats (filtered by month/year)
    const totalTabarukats = await tabarukatModel.count({
      where: {
        ...tabarukatWhere,
        [Op.and]: [
          literal(`MONTH(created_at) = ${selectedMonth}`),
          literal(`YEAR(created_at) = ${selectedYear}`),
        ],
      },
    });

    return {
      totalKarkuns,
      ehadKarkuns,
      totalNewEhads,
      totalTabarukats,
    };
  } catch (error) {
    logger.error("Error calculating basic stats:", error);
    throw error;
  }
};

/**
 * Calculate Zone Admin Stats
 */
const calculateZoneAdminStats = async (filters) => {
  try {
    const { selectedMonth, selectedYear, selectedZoneId } = filters;

    if (!selectedZoneId) {
      return {
        totalMehfils: 0,
        mehfilsWithReports: 0,
        mehfilsWithoutReports: 0,
        reportSubmissionRate: 0,
        mehfilsWithReportsList: [],
        mehfilsWithoutReportsList: [],
      };
    }

    // Get all published mehfils in the zone
    const allMehfils = await mehfilDirectoryModel.findAll({
      where: {
        zone_id: selectedZoneId,
        is_published: 1,
      },
    });

    const totalMehfils = allMehfils.length;

    // Get mehfils that have submitted reports for the selected month/year
    const reportsInMonth = await mehfilReportsModel.findAll({
      where: {
        zone_id: selectedZoneId,
        report_month: selectedMonth,
        report_year: selectedYear,
      },
      attributes: [
        "mehfil_directory_id",
        "coordinator_name",
        "total_duty_karkuns",
        "mehfil_days_in_month",
        "created_at",
      ],
    });

    const mehfilsWithReportsIds = [
      ...new Set(reportsInMonth.map((r) => r.mehfil_directory_id)),
    ];

    // Build mehfils with reports list
    const mehfilsWithReportsList = await Promise.all(
      mehfilsWithReportsIds.map(async (mehfilId) => {
        const mehfil = allMehfils.find((m) => m.id === mehfilId);
        const report = reportsInMonth.find(
          (r) => r.mehfil_directory_id === mehfilId
        );

        if (!mehfil) return null;

        return {
          id: mehfil.id,
          mehfil_number: mehfil.mehfil_number,
          name: mehfil.name_en,
          address: mehfil.address_en,
          submitted_at: report
            ? new Date(report.created_at).toISOString()
            : null,
          coordinator_name: report?.coordinator_name || null,
          total_duty_karkuns: report?.total_duty_karkuns || 0,
          mehfil_days_in_month: report?.mehfil_days_in_month || 0,
        };
      })
    );

    // Build mehfils without reports list
    const mehfilsWithoutReportsIds = allMehfils
      .filter((m) => !mehfilsWithReportsIds.includes(m.id))
      .map((m) => m.id);

    const mehfilsWithoutReportsList = await Promise.all(
      mehfilsWithoutReportsIds.map(async (mehfilId) => {
        const mehfil = allMehfils.find((m) => m.id === mehfilId);
        if (!mehfil) return null;

        // Get last report if any
        const lastReport = await mehfilReportsModel.findOne({
          where: { mehfil_directory_id: mehfilId },
          order: [["created_at", "DESC"]],
          attributes: ["report_month", "report_year"],
        });

        return {
          id: mehfil.id,
          mehfil_number: mehfil.mehfil_number,
          name: mehfil.name_en,
          address: mehfil.address_en,
          zimdar_bhai_name: mehfil.zimdar_bhai || null,
          zimdar_bhai_phone: mehfil.zimdar_bhai_phone_number || null,
          last_report: lastReport
            ? `${lastReport.report_month}/${lastReport.report_year}`
            : "Never",
        };
      })
    );

    const mehfilsWithReports = mehfilsWithReportsIds.length;
    const mehfilsWithoutReports = totalMehfils - mehfilsWithReports;
    const reportSubmissionRate =
      totalMehfils > 0
        ? Math.round((mehfilsWithReports / totalMehfils) * 1000) / 10
        : 0;

    return {
      totalMehfils,
      mehfilsWithReports,
      mehfilsWithoutReports,
      reportSubmissionRate,
      mehfilsWithReportsList: mehfilsWithReportsList.filter((m) => m !== null),
      mehfilsWithoutReportsList: mehfilsWithoutReportsList.filter(
        (m) => m !== null
      ),
    };
  } catch (error) {
    logger.error("Error calculating zone admin stats:", error);
    throw error;
  }
};

/**
 * Calculate Mehfil Admin Stats
 */
const calculateMehfilAdminStats = async (filters, user) => {
  try {
    const { selectedMonth, selectedYear } = filters;
    const mehfilDirectoryId = user.mehfil_directory_id;

    if (!mehfilDirectoryId) {
      return {
        hasSubmittedReport: false,
        monthlyAttendanceDays: 0,
        totalDutyKarkuns: 0,
      };
    }

    const report = await mehfilReportsModel.findOne({
      where: {
        mehfil_directory_id: mehfilDirectoryId,
        report_month: selectedMonth,
        report_year: selectedYear,
      },
    });

    return {
      hasSubmittedReport: !!report,
      monthlyAttendanceDays: report?.coordinator_monthly_attendance_days || 0,
      totalDutyKarkuns: report?.total_duty_karkuns || 0,
    };
  } catch (error) {
    logger.error("Error calculating mehfil admin stats:", error);
    throw error;
  }
};

/**
 * Calculate Region Admin Stats (all zones)
 */
const calculateRegionAdminStats = async (filters, user) => {
  try {
    const { selectedMonth, selectedYear } = filters;

    // Get zones based on user permissions
    const zones = await getZonesForUser(user);
    const totalZones = zones.length;

    // Calculate stats for each zone
    const zoneReportStats = await Promise.all(
      zones.map(async (zone) => {
        // Total mehfils in zone
        const totalMehfils = await mehfilDirectoryModel.count({
          where: { zone_id: zone.id, is_published: 1 },
        });

        // Karkuns in zone
        const karkun = await userModel.count({
          where: { zone_id: zone.id, user_type: "Karkun" },
        });

        // Ehad Karkuns in zone
        const ehadKarkun = await userModel.count({
          where: { zone_id: zone.id, user_type: "EhadKarkun" },
        });

        // Tabarukats in zone
        const tabarukats = await tabarukatModel.count({
          where: { zone_id: zone.id },
        });

        // New Ehads in zone for selected month/year
        const newEhad = await newEhadModel.count({
          where: {
            zone_id: zone.id,
            [Op.and]: [
              literal(`MONTH(created_at) = ${selectedMonth}`),
              literal(`YEAR(created_at) = ${selectedYear}`),
            ],
          },
        });

        // Reports submitted in zone for selected month/year
        const reportsSubmitted = await mehfilReportsModel.count({
          where: {
            zone_id: zone.id,
            report_month: selectedMonth,
            report_year: selectedYear,
          },
          distinct: true,
          col: "mehfil_directory_id",
        });

        const submissionRate =
          totalMehfils > 0
            ? Math.round((reportsSubmitted / totalMehfils) * 1000) / 10
            : 0;

        return {
          zone_id: zone.id,
          zone_name: zone.title_en,
          total_mehfils: totalMehfils,
          karkun,
          ehad_karkun: ehadKarkun,
          tabarukats,
          new_ehad: newEhad,
          reports_submitted: reportsSubmitted,
          submission_rate: submissionRate,
        };
      })
    );

    return {
      totalZones,
      zonesWithReports: 0, // Can be calculated if needed
      zoneReportStats,
    };
  } catch (error) {
    logger.error("Error calculating region admin stats:", error);
    throw error;
  }
};

/**
 * Get dashboard stats with role-based filtering
 */
exports.getDashboardStats = async (filters, user) => {
  try {
    const { selectedMonth, selectedYear, selectedZoneId, selectedMehfilId } =
      filters;

    // Calculate basic stats
    const basicStats = await calculateBasicStats(filters);

    // Calculate zone admin stats
    const zoneStats = await calculateZoneAdminStats(filters);

    // Calculate mehfil admin stats
    const mehfilStats = await calculateMehfilAdminStats(filters, user);

    // Calculate region admin stats
    const regionStats = await calculateRegionAdminStats(filters, user);

    // Get zones and mehfils based on permissions
    const zones = await getZonesForUser(user);
    const mehfils = selectedZoneId
      ? await getMehfilsForZone(selectedZoneId)
      : [];

    logger.info("Dashboard stats calculated:", {
      zonesCount: zones.length,
      mehfilsCount: mehfils.length,
      userRole: {
        is_zone_admin: user.is_zone_admin,
        is_region_admin: user.is_region_admin,
        is_all_region_admin: user.is_all_region_admin,
        is_super_admin: user.is_super_admin,
        zone_id: user.zone_id,
        region_id: user.region_id,
      },
      zones: zones.map(z => ({ id: z.id, title: z.title_en })),
    });

    return {
      ...basicStats,
      ...zoneStats,
      ...mehfilStats,
      ...regionStats,
      zones,
      mehfils,
    };
  } catch (error) {
    logger.error("Error getting dashboard stats:", error);
    throw error;
  }
};

/**
 * Get overall totals (not filtered)
 */
exports.getOverallTotals = async () => {
  try {
    const totalKarkunans = await userModel.count({
      where: { user_type: "Karkun" },
    });

    const totalEhadKarkuns = await userModel.count({
      where: { user_type: "EhadKarkun" },
    });

    const totalMehfils = await mehfilDirectoryModel.count({
      where: { is_published: 1 },
    });

    const totalZones = await zonesModel.count();

    const totalMehfilReports = await mehfilReportsModel.count();

    return {
      totalKarkunans,
      totalEhadKarkuns,
      totalMehfils,
      totalZones,
      totalMehfilReports,
      totalDutyTypes: 0, // Add if you have duty types model
      totalCoordinators: 0, // Add if you have coordinators model
    };
  } catch (error) {
    logger.error("Error getting overall totals:", error);
    throw error;
  }
};

// Export helper functions for reuse
exports.getZonesForUser = getZonesForUser;
exports.getMehfilsForZone = getMehfilsForZone;

