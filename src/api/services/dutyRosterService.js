const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const dutyRosterModel = require("../models/dutyRoster")(db);

/**
 * Get all duty rosters with pagination and search
 */
exports.getAllDutyRosters = async ({ page = 1, size = 10, search = "", zoneId = null, mehfilDirectoryId = null }) => {
  try {
    const limit = parseInt(size) || 10;
    const offset = (parseInt(page) - 1) * limit;

    const whereClause = {};

    // Filter by zone
    if (zoneId) {
      whereClause.zone_id = zoneId;
    }

    // Filter by mehfil directory
    if (mehfilDirectoryId) {
      whereClause.mehfil_directory_id = mehfilDirectoryId;
    }

    // Search by user_id
    if (search) {
      if (!isNaN(search)) {
        whereClause.user_id = search;
      }
    }

    const { count, rows } = await dutyRosterModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
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
    logger.error(`Error fetching duty rosters: ${error.message}`);
    throw error;
  }
};

/**
 * Get a single duty roster by ID
 */
exports.getDutyRosterById = async (id) => {
  try {
    const dutyRoster = await dutyRosterModel.findByPk(id);
    if (!dutyRoster) {
      throw new Error("Duty roster not found");
    }
    return dutyRoster;
  } catch (error) {
    logger.error(`Error fetching duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new duty roster
 */
exports.createDutyRoster = async (data) => {
  try {
    const dutyRoster = await dutyRosterModel.create({
      ...data,
      created_at: new Date(),
    });
    return dutyRoster;
  } catch (error) {
    logger.error(`Error creating duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Update a duty roster
 */
exports.updateDutyRoster = async (id, data) => {
  try {
    const dutyRoster = await dutyRosterModel.findByPk(id);
    if (!dutyRoster) {
      throw new Error("Duty roster not found");
    }

    await dutyRoster.update({
      ...data,
      updated_at: new Date(),
    });

    return dutyRoster;
  } catch (error) {
    logger.error(`Error updating duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a duty roster
 */
exports.deleteDutyRoster = async (id) => {
  try {
    const dutyRoster = await dutyRosterModel.findByPk(id);
    if (!dutyRoster) {
      throw new Error("Duty roster not found");
    }

    await dutyRoster.destroy();
    return { success: true, message: "Duty roster deleted successfully" };
  } catch (error) {
    logger.error(`Error deleting duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Get duty roster by user (karkun)
 */
exports.getDutyRosterByKarkun = async (userId) => {
  try {
    const whereClause = { user_id: userId };

    const dutyRosters = await dutyRosterModel.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
    });

    return dutyRosters;
  } catch (error) {
    logger.error(`Error fetching duty roster by user: ${error.message}`);
    throw error;
  }
};


