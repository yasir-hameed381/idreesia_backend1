const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const mehfilCoordinatorModel = require("../models/mehfilCoordinator")(db);

/**
 * Get all coordinators with pagination and search
 */
exports.getAllCoordinators = async ({ page = 1, size = 10, search = "", mehfilDirectoryId = null }) => {
  try {
    const limit = parseInt(size) || 10;
    const offset = (parseInt(page) - 1) * limit;

    const whereClause = {};

    if (mehfilDirectoryId) {
      whereClause.mehfil_directory_id = mehfilDirectoryId;
    }

    if (search) {
      whereClause[Op.or] = [
        { coordinator_type: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await mehfilCoordinatorModel.findAndCountAll({
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
    logger.error(`Error fetching coordinators: ${error.message}`);
    throw error;
  }
};

/**
 * Get a single coordinator by ID
 */
exports.getCoordinatorById = async (id) => {
  try {
    const coordinator = await mehfilCoordinatorModel.findByPk(id);
    if (!coordinator) {
      throw new Error("Coordinator not found");
    }
    return coordinator;
  } catch (error) {
    logger.error(`Error fetching coordinator: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new coordinator
 */
exports.createCoordinator = async (data) => {
  try {
    const coordinator = await mehfilCoordinatorModel.create({
      ...data,
      created_at: new Date(),
    });
    return coordinator;
  } catch (error) {
    logger.error(`Error creating coordinator: ${error.message}`);
    throw error;
  }
};

/**
 * Update a coordinator
 */
exports.updateCoordinator = async (id, data) => {
  try {
    const coordinator = await mehfilCoordinatorModel.findByPk(id);
    if (!coordinator) {
      throw new Error("Coordinator not found");
    }

    await coordinator.update({
      ...data,
      updated_at: new Date(),
    });

    return coordinator;
  } catch (error) {
    logger.error(`Error updating coordinator: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a coordinator
 */
exports.deleteCoordinator = async (id) => {
  try {
    const coordinator = await mehfilCoordinatorModel.findByPk(id);
    if (!coordinator) {
      throw new Error("Coordinator not found");
    }

    await coordinator.destroy();
    return { success: true, message: "Coordinator deleted successfully" };
  } catch (error) {
    logger.error(`Error deleting coordinator: ${error.message}`);
    throw error;
  }
};

/**
 * Get coordinators for a mehfil
 */
exports.getActiveCoordinatorsByMehfil = async (mehfilDirectoryId) => {
  try {
    const coordinators = await mehfilCoordinatorModel.findAll({
      where: {
        mehfil_directory_id: mehfilDirectoryId,
      },
      order: [["coordinator_type", "ASC"], ["created_at", "DESC"]],
    });
    return coordinators;
  } catch (error) {
    logger.error(`Error fetching coordinators by mehfil: ${error.message}`);
    throw error;
  }
};


