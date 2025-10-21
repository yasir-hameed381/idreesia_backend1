const logger = require("../../config/logger");
const dutyRosterService = require("../services/dutyRosterService");

/**
 * Get all duty rosters with pagination
 */
exports.getAllDutyRosters = async (req, res, next) => {
  try {
    const { page, size, search, zoneId, mehfilDirectoryId } = req.query;

    const result = await dutyRosterService.getAllDutyRosters({
      page,
      size,
      search,
      zoneId,
      mehfilDirectoryId,
    });

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching duty rosters:", error);
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
 * Create a new duty roster
 */
exports.createDutyRoster = async (req, res, next) => {
  try {
    const {
      user_id,
      zone_id,
      mehfil_directory_id,
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
      created_by,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const dutyRoster = await dutyRosterService.createDutyRoster({
      user_id,
      zone_id,
      mehfil_directory_id,
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
      created_by,
    });

    return res.status(201).json({
      success: true,
      message: "Duty roster created successfully",
      data: dutyRoster,
    });
  } catch (error) {
    logger.error("Error creating duty roster:", error);
    return next(error);
  }
};

/**
 * Update a duty roster
 */
exports.updateDutyRoster = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      zone_id,
      mehfil_directory_id,
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
      updated_by,
    } = req.body;

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
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
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


