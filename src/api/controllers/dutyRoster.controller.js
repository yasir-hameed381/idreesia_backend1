const logger = require("../../config/logger");
const dutyRosterService = require("../services/dutyRosterService");
const dutyRosterAssignmentService = require("../services/dutyRosterAssignmentService");

/**
 * Get all duty rosters with assignments (matching Laravel implementation)
 */
exports.getAllDutyRosters = async (req, res, next) => {
  try {
    // No filters applied - get all duty rosters
    const result = await dutyRosterService.getAllDutyRosters({});

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching duty rosters:", error);
    return next(error);
  }
};

/**
 * Get karkuns/ehad karkuns available for roster assignment
 */
exports.getAvailableKarkuns = async (req, res, next) => {
  try {
    const { zoneId, mehfilDirectoryId, userTypeFilter, search } = req.query;

    if (!zoneId) {
      return res.status(400).json({
        success: false,
        message: "zoneId is required",
      });
    }

    const karkuns = await dutyRosterService.getAvailableKarkuns({
      zoneId,
      mehfilDirectoryId,
      userTypeFilter: userTypeFilter || "karkun",
      search: search || "",
    });

    return res.json({
      success: true,
      data: karkuns,
    });
  } catch (error) {
    logger.error("Error fetching available karkuns:", error);
    return next(error);
  }
};

/**
 * Get duty roster by user
 */
exports.getDutyRosterByKarkun = async (req, res, next) => {
  try {
    const { ehadKarkunId } = req.params;

    if (!ehadKarkunId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const dutyRosters = await dutyRosterService.getDutyRosterByKarkun(ehadKarkunId);

    return res.json({
      success: true,
      data: dutyRosters,
    });
  } catch (error) {
    logger.error("Error fetching duty roster by user:", error);
    return next(error);
  }
};

/**
 * Get a single duty roster by ID
 */
exports.getDutyRosterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dutyRoster = await dutyRosterService.getDutyRosterById(id);
    return res.json({
      success: true,
      data: dutyRoster,
    });
  } catch (error) {
    logger.error("Error fetching duty roster:", error);
    return next(error);
  }
};

/**
 * Create a new duty roster (add karkun to roster)
 */
exports.createDutyRoster = async (req, res, next) => {
  try {
    const { user_id, zone_id, mehfil_directory_id, created_by } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    // Extract duty assignments from request body
    const duties = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      const dutyTypeId = req.body[`duty_type_id_${day}`];
      if (dutyTypeId) {
        duties[day] = parseInt(dutyTypeId);
      }
    });

    const dutyRoster = await dutyRosterService.createDutyRoster({
      user_id,
      zone_id,
      mehfil_directory_id,
      created_by,
      duties, // Pass duty assignments to service
    });

    return res.status(201).json({
      success: true,
      message: "Karkun added to roster successfully",
      data: dutyRoster,
    });
  } catch (error) {
    logger.error("Error creating duty roster:", error);
    if (error.message.includes("already in the roster")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("select a mehfil")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

/**
 * Update a duty roster
 */
exports.updateDutyRoster = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, zone_id, mehfil_directory_id, updated_by } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Duty roster ID is required",
      });
    }

    const dutyRoster = await dutyRosterService.updateDutyRoster(id, {
      user_id,
      zone_id,
      mehfil_directory_id,
      updated_by,
    });

    return res.json({
      success: true,
      message: "Duty roster updated successfully",
      data: dutyRoster,
    });
  } catch (error) {
    logger.error("Error updating duty roster:", error);
    return next(error);
  }
};

/**
 * Add duty assignment to roster
 */
exports.addDuty = async (req, res, next) => {
  try {
    const { mehfilDirectoryId, rosterId, day, dutyTypeId } = req.body;

    if (!rosterId || !day || !dutyTypeId) {
      return res.status(400).json({
        success: false,
        message: "rosterId, day, and dutyTypeId are required",
      });
    }

    const assignment = await dutyRosterAssignmentService.createAssignment({
      duty_roster_id: rosterId,
      duty_type_id: dutyTypeId,
      day,
    });

    return res.json({
      success: true,
      message: "Duty added successfully",
      data: assignment,
    });
  } catch (error) {
    logger.error("Error adding duty:", error);
    if (
      error.message.includes("already assigned") ||
      error.message.includes("coordinator")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

/**
 * Remove duty assignment from roster
 */
exports.removeDuty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const result = await dutyRosterAssignmentService.deleteAssignment(id);
    return res.json({
      success: true,
      message: "Duty removed successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error removing duty:", error);
    return next(error);
  }
};

/**
 * Delete a duty roster
 */
exports.deleteDutyRoster = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Duty roster ID is required",
      });
    }

    const result = await dutyRosterService.deleteDutyRoster(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting duty roster:", error);
    return next(error);
  }
};


