const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const dutyTypeModel = require("../models/dutyType")(db);

/**
 * Get all duty types with pagination and search
 */
exports.getAllDutyTypes = async ({ page = 1, size = 10, search = "" }) => {
  try {
    const limit = parseInt(size) || 10;
    const offset = (parseInt(page) - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await dutyTypeModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["name", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      totalItems: count,
      totalPages,
      currentPage: parseInt(page),
      pageSize: limit,
      data: rows,
    };
  } catch (error) {
    logger.error(`Error fetching duty types: ${error.message}`);
    throw error;
  }
};

/**
 * Get a single duty type by ID
 */
exports.getDutyTypeById = async (id) => {
  try {
    const dutyType = await dutyTypeModel.findByPk(id);
    if (!dutyType) {
      throw new Error("Duty type not found");
    }
    return dutyType;
  } catch (error) {
    logger.error(`Error fetching duty type: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new duty type
 */
exports.createDutyType = async (data) => {
  try {
    const dutyType = await dutyTypeModel.create({
      ...data,
      created_at: new Date(),
    });
    return dutyType;
  } catch (error) {
    logger.error(`Error creating duty type: ${error.message}`);
    throw error;
  }
};

/**
 * Update a duty type
 */
exports.updateDutyType = async (id, data) => {
  try {
    const dutyType = await dutyTypeModel.findByPk(id);
    if (!dutyType) {
      throw new Error("Duty type not found");
    }

    await dutyType.update({
      ...data,
      updated_at: new Date(),
    });

    return dutyType;
  } catch (error) {
    logger.error(`Error updating duty type: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a duty type
 */
exports.deleteDutyType = async (id) => {
  try {
    const dutyType = await dutyTypeModel.findByPk(id);
    if (!dutyType) {
      throw new Error("Duty type not found");
    }

    await dutyType.destroy();
    return { success: true, message: "Duty type deleted successfully" };
  } catch (error) {
    logger.error(`Error deleting duty type: ${error.message}`);
    throw error;
  }
};

/**
 * Get all active duty types (not hidden)
 */
exports.getActiveDutyTypes = async () => {
  try {
    // Explicitly exclude is_hidden column as it doesn't exist in the database
    const dutyTypes = await dutyTypeModel.findAll({
      attributes: [
        "id",
        "zone_id",
        "name",
        "description",
        "is_editable",
        "created_by",
        "updated_by",
        "created_at",
        "updated_at",
      ],
      order: [["name", "ASC"]],
    });
    return dutyTypes;
  } catch (error) {
    logger.error(`Error fetching active duty types: ${error.message}`);
    throw error;
  }
};


