const logger = require("../../config/logger");
const mehfilCoordinatorService = require("../services/mehfilCoordinatorService");

/**
 * Get all coordinators with pagination
 */
exports.getAllCoordinators = async (req, res, next) => {
  try {
    const { page, size, search, mehfilDirectoryId } = req.query;

    const result = await mehfilCoordinatorService.getAllCoordinators({
      page,
      size,
      search,
      mehfilDirectoryId,
    });

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching coordinators:", error);
    return next(error);
  }
};

/**
 * Get active coordinators for a mehfil
 */
exports.getActiveCoordinatorsByMehfil = async (req, res, next) => {
  try {
    const { mehfilDirectoryId } = req.params;

    if (!mehfilDirectoryId) {
      return res.status(400).json({
        success: false,
        message: "Mehfil Directory ID is required",
      });
    }

    const coordinators = await mehfilCoordinatorService.getActiveCoordinatorsByMehfil(mehfilDirectoryId);
    return res.json({
      success: true,
      data: coordinators,
    });
  } catch (error) {
    logger.error("Error fetching active coordinators:", error);
    return next(error);
  }
};

/**
 * Get a single coordinator by ID
 */
exports.getCoordinatorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coordinator = await mehfilCoordinatorService.getCoordinatorById(id);
    return res.json({
      success: true,
      data: coordinator,
    });
  } catch (error) {
    logger.error("Error fetching coordinator:", error);
    return next(error);
  }
};

/**
 * Create a new coordinator
 */
exports.createCoordinator = async (req, res, next) => {
  try {
    const {
      mehfil_directory_id,
      user_id,
      coordinator_type,
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
    } = req.body;

    if (!mehfil_directory_id || !user_id || !coordinator_type) {
      return res.status(400).json({
        success: false,
        message: "mehfil_directory_id, user_id, and coordinator_type are required",
      });
    }

    const coordinator = await mehfilCoordinatorService.createCoordinator({
      mehfil_directory_id,
      user_id,
      coordinator_type,
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
    });

    return res.status(201).json({
      success: true,
      message: "Coordinator created successfully",
      data: coordinator,
    });
  } catch (error) {
    logger.error("Error creating coordinator:", error);
    return next(error);
  }
};

/**
 * Update a coordinator
 */
exports.updateCoordinator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      mehfil_directory_id,
      user_id,
      coordinator_type,
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Coordinator ID is required",
      });
    }

    const coordinator = await mehfilCoordinatorService.updateCoordinator(id, {
      mehfil_directory_id,
      user_id,
      coordinator_type,
      duty_type_id_monday,
      duty_type_id_tuesday,
      duty_type_id_wednesday,
      duty_type_id_thursday,
      duty_type_id_friday,
      duty_type_id_saturday,
      duty_type_id_sunday,
    });

    return res.json({
      success: true,
      message: "Coordinator updated successfully",
      data: coordinator,
    });
  } catch (error) {
    logger.error("Error updating coordinator:", error);
    return next(error);
  }
};

/**
 * Delete a coordinator
 */
exports.deleteCoordinator = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Coordinator ID is required",
      });
    }

    const result = await mehfilCoordinatorService.deleteCoordinator(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting coordinator:", error);
    return next(error);
  }
};


