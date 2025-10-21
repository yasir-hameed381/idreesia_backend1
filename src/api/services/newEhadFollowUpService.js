const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const newEhadFollowUpModel = require("../models/newEhadFollowUp")(db);

/**
 * Get all follow-ups for a specific new ehad
 */
exports.getFollowUpsByNewEhadId = async (newEhadId) => {
  try {
    const followUps = await newEhadFollowUpModel.findAll({
      where: { new_ehad_id: newEhadId },
      order: [["follow_up_date", "DESC"]],
    });
    return followUps;
  } catch (error) {
    logger.error(`Error fetching follow-ups: ${error.message}`);
    throw error;
  }
};

/**
 * Get all follow-ups with pagination and search
 */
exports.getAllFollowUps = async ({ page = 1, size = 10, search = "" }) => {
  try {
    const limit = parseInt(size) || 10;
    const offset = (parseInt(page) - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { contact_method: { [Op.like]: `%${search}%` } },
            { status: { [Op.like]: `%${search}%` } },
            { notes: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await newEhadFollowUpModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["follow_up_date", "DESC"]],
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
    logger.error(`Error fetching all follow-ups: ${error.message}`);
    throw error;
  }
};

/**
 * Get a single follow-up by ID
 */
exports.getFollowUpById = async (id) => {
  try {
    const followUp = await newEhadFollowUpModel.findByPk(id);
    if (!followUp) {
      throw new Error("Follow-up not found");
    }
    return followUp;
  } catch (error) {
    logger.error(`Error fetching follow-up: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new follow-up
 */
exports.createFollowUp = async (data) => {
  try {
    const followUp = await newEhadFollowUpModel.create({
      ...data,
      created_at: new Date(),
    });
    return followUp;
  } catch (error) {
    logger.error(`Error creating follow-up: ${error.message}`);
    throw error;
  }
};

/**
 * Update a follow-up
 */
exports.updateFollowUp = async (id, data) => {
  try {
    const followUp = await newEhadFollowUpModel.findByPk(id);
    if (!followUp) {
      throw new Error("Follow-up not found");
    }

    await followUp.update({
      ...data,
      updated_at: new Date(),
    });

    return followUp;
  } catch (error) {
    logger.error(`Error updating follow-up: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a follow-up
 */
exports.deleteFollowUp = async (id) => {
  try {
    const followUp = await newEhadFollowUpModel.findByPk(id);
    if (!followUp) {
      throw new Error("Follow-up not found");
    }

    await followUp.destroy();
    return { success: true, message: "Follow-up deleted successfully" };
  } catch (error) {
    logger.error(`Error deleting follow-up: ${error.message}`);
    throw error;
  }
};


