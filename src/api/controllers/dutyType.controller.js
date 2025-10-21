const logger = require("../../config/logger");
const dutyTypeService = require("../services/dutyTypeService");

/**
 * Get all duty types with pagination
 */
exports.getAllDutyTypes = async (req, res, next) => {
  try {
    const { page, size, search } = req.query;

    const result = await dutyTypeService.getAllDutyTypes({
      page,
      size,
      search,
    });

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching duty types:", error);
    return next(error);
  }
};

/**
 * Get all active duty types
 */
exports.getActiveDutyTypes = async (req, res, next) => {
  try {
    const dutyTypes = await dutyTypeService.getActiveDutyTypes();
    return res.json({
      success: true,
      data: dutyTypes,
    });
  } catch (error) {
    logger.error("Error fetching active duty types:", error);
    return next(error);
  }
};

/**
 * Get a single duty type by ID
 */
exports.getDutyTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dutyType = await dutyTypeService.getDutyTypeById(id);
    return res.json({
      success: true,
      data: dutyType,
    });
  } catch (error) {
    logger.error("Error fetching duty type:", error);
    return next(error);
  }
};

/**
 * Create a new duty type
 */
exports.createDutyType = async (req, res, next) => {
  try {
    const {
      zone_id,
      name,
      description,
      is_editable = 1,
      is_hidden = 0,
      created_by,
    } = req.body;

    if (!zone_id || !name) {
      return res.status(400).json({
        success: false,
        message: "zone_id and name are required",
      });
    }

    const dutyType = await dutyTypeService.createDutyType({
      zone_id,
      name,
      description,
      is_editable,
      is_hidden,
      created_by,
    });

    return res.status(201).json({
      success: true,
      message: "Duty type created successfully",
      data: dutyType,
    });
  } catch (error) {
    logger.error("Error creating duty type:", error);
    return next(error);
  }
};

/**
 * Update a duty type
 */
exports.updateDutyType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      zone_id,
      name,
      description,
      is_editable,
      is_hidden,
      updated_by,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Duty type ID is required",
      });
    }

    const dutyType = await dutyTypeService.updateDutyType(id, {
      zone_id,
      name,
      description,
      is_editable,
      is_hidden,
      updated_by,
    });

    return res.json({
      success: true,
      message: "Duty type updated successfully",
      data: dutyType,
    });
  } catch (error) {
    logger.error("Error updating duty type:", error);
    return next(error);
  }
};

/**
 * Delete a duty type
 */
exports.deleteDutyType = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Duty type ID is required",
      });
    }

    const result = await dutyTypeService.deleteDutyType(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting duty type:", error);
    return next(error);
  }
};


