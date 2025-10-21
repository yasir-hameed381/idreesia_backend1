const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const wazaifsModel = require("../models/wazaifs")(db);
const {
  paginate,
  constructPagination,
} = require("../services/utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

// Function to get Wazaifs data with pagination, filtering, and search capabilities
exports.getWazaifs = async ({
  page = 1,
  size = 100,
  category = "",
  search = "",
  requestUrl = "",
}) => {
  try {
    // Define the fields to be searched when a search query is provided
    const searchFields = [
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.DESCRIPTION,
      SearchFields.SLUG,
    ];

    // Calculate pagination parameters (offset and limit) and derive the current page
    const { offset, limit, currentPage } = await paginate({ page, size });

    // Initialize the 'where' condition for the query
    const where = {};

    // Add search conditions if a search query is provided
    if (search && searchFields.length > 0) {
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Partial match using SQL's LIKE operator
      }));
    }

    // Add a category filter if a category is specified
    if (category) {
      where.category_id = category;
    }

    // Fetch data from the Wazaifs model with the specified conditions and pagination
    const { count, rows: data } = await wazaifsModel.findAndCountAll({
      where,
      offset,
      limit,
    });

    // Construct pagination links and metadata for the response
    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    // Return the fetched data along with pagination details
    return {
      data,
      links,
      meta,
    };
  } catch (error) {
    // Log the error message for debugging purposes
    logger.error("Error fetching wazaifs: " + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.createWazaifShareef = async ({
  slug,
  title_en,
  title_ur,
  description,
  images,
  created_by,
}) => {
  try {
    const createWazaifPayload = {
      slug,
      title_en,
      title_ur,
      description,
      images,
      created_at: new Date(),
      created_by: created_by,
    };

    return await wazaifsModel.create(createWazaifPayload);
  } catch (error) {
    logger.error(`Error creating Wazaif: ${error.message}`);
    throw new Error(`Failed to create Wazaif: ${error.message}`);
  }
};

exports.updateWazaifShareef = async ({
  id,
  slug,
  title_en,
  title_ur,
  description,
  images,
  updated_by,
}) => {
  try {
    const wazaifCheck = await wazaifsModel.findByPk(id);
    if (!wazaifCheck) {
      return {
        success: false,
        message: "Wazaif Data not found",
      };
    }

    const updateWazaifPayload = {
      slug,
      title_en,
      title_ur,
      description,
      images,
      updated_at: new Date(),
      updated_by: updated_by,
    };

    await wazaifsModel.update(updateWazaifPayload, { where: { id } });
    return {
      success: true,
      message: "Wazaif updated successfully",
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error update Wazaif:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.removeWazaifShareef = async (wazaif_id) => {
  try {
    // Check if the mehfil exists
    if (!wazaif_id || isNaN(wazaif_id)) {
      return {
        success: false,
        message: "Invalid wazaif ID provided",
      };
    }

    const wazaif = await wazaifsModel.findByPk(wazaif_id);
    if (!wazaif) {
      return {
        success: true,
        message: "wazaif data not found.",
      };
    }

    console.log("wazaif data", wazaif);

    // Delete the wazaif
    await wazaif.destroy();

    return {
      success: true,
      message: "Wazaif deleted successfully.",
    };
  } catch (error) {
    logger.error("Error deleting Wazaif:", error);
    throw new Error("failed to delete wazaif", error.message);
  }
};
