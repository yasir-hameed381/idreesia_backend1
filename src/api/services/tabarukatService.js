const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const tabarukatModel = require("../models/tabarukat")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

// Create Tabarukat
exports.createTabarukat = async ({
  name,
  description,
  co_name,
  phone_number,
  images,
  mehfil_directory_id,
  zone_id,
  created_by,
}) => {
  try {
    const createTabarukatPayload = {
      name,
      description,
      co_name,
      phone_number,
      images,
      mehfil_directory_id,
      zone_id,
      created_by,
      created_at: new Date(),
    };

    return await tabarukatModel.create(createTabarukatPayload);
  } catch (error) {
    logger.error(`Error creating Tabarukat: ${error.message}`);
    throw new Error(`Failed to create Tabarukat: ${error.message}`);
  }
};  

// Get Tabarukat with Pagination + Search + Filters
exports.getTabarukat = async ({
  page = 1,
  size = 50,
  search = "",
  zone_id,
  mehfil_directory_id,
  requestUrl = "",
}) => {
  try {
    const searchFields = [SearchFields.NAME, SearchFields.DESCRIPTION];

    const { offset, limit, currentPage } = await paginate({ page, size });

    const where = {};

    // Search filter (text fields only; zone/mehfil filtered separately)
    if (search && search.trim() && searchFields.length > 0) {
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search.trim()}%` },
      }));
    }

    // Zone filter
    if (zone_id) {
      // Handle both string and number
      const zoneIdStr = String(zone_id).trim();
      if (zoneIdStr) {
        const zoneIdNum = parseInt(zoneIdStr);
        if (!isNaN(zoneIdNum)) {
          where.zone_id = zoneIdNum;
        }
      }
    }

    // Mehfil directory filter
    if (mehfil_directory_id) {
      // Handle both string and number
      const mehfilIdStr = String(mehfil_directory_id).trim();
      if (mehfilIdStr) {
        const mehfilId = parseInt(mehfilIdStr);
        if (!isNaN(mehfilId)) {
          where.mehfil_directory_id = mehfilId;
        }
      }
    }

    const { count, rows: data } = await tabarukatModel.findAndCountAll({
      where,
      offset,
      limit,
    });

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    return {
      data,
      links,
      meta,
    };
  } catch (error) {
    logger.error("Error fetching Tabarukat:" + error.message);
    throw new Error(`Failed to fetch Tabarukat: ${error.message}`);
  }
};

// Get Tabarukat by ID
exports.getTabarukatById = async (id) => {
  try {
    if (!id) {
      return { success: false, message: "Tabarukat not found" };
    }
    const tabarukat = await tabarukatModel.findByPk(id);
    if (!tabarukat) {
      return { success: false, message: "Tabarukat not found" };
    }
    return {
      success: true,
      data: tabarukat,
    };
  } catch (error) {
    logger.error("Error fetching Tabarukat by ID:", error.message);
    throw new Error(`Failed to fetch Tabarukat: ${error.message}`);
  }
};

// Update Tabarukat
exports.updateTabarukat = async ({
  id,
  name,
  description,
  co_name,
  phone_number,
  images,
  mehfil_directory_id,
  zone_id,
  updated_by,
}) => {
  try {
    const tabarukatCheck = await tabarukatModel.findByPk(id);
    if (!tabarukatCheck) {
      return {
        success: false,
        message: "Tabarukat not found",
      };
    }

    const updatePayload = {
      name,
      description,
      co_name,
      phone_number,
      images,
      mehfil_directory_id,
      zone_id,
      updated_by,
      updated_at: new Date(),
    };

    await tabarukatModel.update(updatePayload, { where: { id } });

    return {
      success: true,
      message: "Tabarukat updated successfully",
    };
  } catch (error) {
    logger.error("Error updating Tabarukat:" + error.message);
    throw new Error(`Failed to update Tabarukat: ${error.message}`);
  }
};

// Delete Tabarukat
exports.deleteTabarukat = async (id) => {
  try {
    const tabarukat = await tabarukatModel.findByPk(id);
    if (!tabarukat) {
      return {
        success: false,
        message: "Tabarukat not found",
      };
    }

    await tabarukat.destroy();
    return {
      success: true,
      message: "Tabarukat deleted successfully",
    };
  } catch (error) {
    logger.error(`Error deleting Tabarukat: ${error.message}`);
    throw new Error(`Failed to delete Tabarukat: ${error.message}`);
  }
};
