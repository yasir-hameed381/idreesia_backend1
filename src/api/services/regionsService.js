const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const regionsModel = require("../models/region")(db);
const zonesModel = require("../models/zone")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

exports.getRegions = async ({
  page = 1,
  size = 50,
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchFields = [
      SearchFields.NAME,
      SearchFields.CO,
    ];

    // Use the pagination service to calculate offset, limit, and currentPage based on the given page and size
    const { offset, limit, currentPage } = await paginate({ page, size });

    // Initialize the 'where' object for query conditions
    const where = {};

    // Add search condition if 'search' is provided and there are fields to search in
    if (search && searchFields.length > 0) {
      // Dynamically generate a WHERE clause for the search fields using Sequelize's Op.like operator
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Perform a LIKE search with the search keyword
      }));
    }

    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved
    const { count, rows: data } = await regionsModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [["id", "ASC"]],
    });

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    // Return the data and pagination details
    // - 'data' contains the rows retrieved from the database
    // - 'pagination' includes the current page, total pages, and total number of items
    return {
      data,
      links,
      meta,
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error fetching regions:" + error.message);
    throw error;
  }
};

exports.createRegion = async ({
  name,
  description,
  co,
  primaryPhoneNumber,
  secondaryPhoneNumber,
}) => {
  try {
    const createRegionPayload = {
      name,
      description,
      co,
      primary_phone_number: primaryPhoneNumber,
      secondary_phone_number: secondaryPhoneNumber,
      created_at: new Date(),
    };

    return await regionsModel.create(createRegionPayload);
  } catch (error) {
    logger.error(`Error creating region: ${error.message}`);
    throw new Error(`Failed to create region: ${error.message}`);
  }
};

exports.updateRegion = async ({
  id,
  name,
  description,
  co,
  primaryPhoneNumber,
  secondaryPhoneNumber,
}) => {
  try {
    const regionCheck = await regionsModel.findByPk(id);
    if (!regionCheck) {
      return {
        success: false,
        message: "Region not found",
      };
    }

    const updateRegionPayload = {
      name,
      description,
      co,
      primary_phone_number: primaryPhoneNumber,
      secondary_phone_number: secondaryPhoneNumber,
      updated_at: new Date(),
    };

    await regionsModel.update(updateRegionPayload, { where: { id: id } });
    return {
      success: true,
      message: "Region updated successfully",
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error update region:" + error.message);
    throw error;
  }
};

exports.deleteRegion = async (id) => {
  try {
    // Check if the region exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: "Invalid region ID provided",
      };
    }

    const region = await regionsModel.findByPk(id);
    if (!region) {
      return {
        success: false,
        message: "Region not found.",
      };
    }

    // Check if region has associated zones (matching Laravel RegionList::deleteRegion)
    const zonesCount = await zonesModel.count({ where: { region_id: id } });
    if (zonesCount > 0) {
      return {
        success: false,
        message: "Cannot delete region with associated zones.",
      };
    }

    // Delete the region
    await region.destroy();

    return {
      success: true,
      message: "Region deleted successfully.",
    };
  } catch (error) {
    logger.error("Error deleting region:", error);
    throw error;
  }
};

exports.getRegionById = async (id) => {
  try {
    // Check if the region exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: "Invalid region ID provided",
      };
    }

    const region = await regionsModel.findByPk(id);
    if (!region) {
      return {
        success: false,
        message: "Region not found.",
      };
    }

    return {
      success: true,
      data: region,
    };
  } catch (error) {
    logger.error("Error fetching region:", error);
    throw error;
  }
};

