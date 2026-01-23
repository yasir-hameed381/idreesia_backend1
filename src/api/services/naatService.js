const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const naatModel = require("../models/naat")(db);
const {
  paginate,
  constructPagination,
} = require("../services/utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

exports.getNaatShareefs = async ({
  page = 1,
  size = 25,
  category = "",
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchTrimmed = typeof search === "string" ? search.trim() : "";
    const categoryTrimmed = typeof category === "string" ? category.trim() : String(category || "");

    const searchFields = [
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.SLUG,
      SearchFields.FILENAME,
      SearchFields.FILEPATH,
      SearchFields.TRACK,
    ];

    const { offset, limit, currentPage } = paginate({ page, size });

    const where = {};

    // Category filter: accept any non-empty value that is not 'all'
    if (categoryTrimmed && categoryTrimmed.toLowerCase() !== "all") {
      const categoryId = parseInt(categoryTrimmed, 10);
      if (!Number.isNaN(categoryId)) {
        where.category_id = categoryId;
      }
    }

    // Search: text fields use LIKE; date string uses CREATED_AT between
    const isDateSearch = searchTrimmed.length > 0 && !Number.isNaN(Date.parse(searchTrimmed));
    if (searchTrimmed && searchFields.length > 0) {
      const orConditions = [];
      for (const field of searchFields) {
        orConditions.push({
          [field]: { [Op.like]: `%${searchTrimmed}%` },
        });
      }
      if (isDateSearch) {
        const start = new Date(searchTrimmed);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        orConditions.push({
          [SearchFields.CREATED_AT]: { [Op.between]: [start, end] },
        });
      }
      where[Op.or] = orConditions;
    }

    const { count, rows: data } = await naatModel.findAndCountAll({
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

    // Return the data and pagination details
    // - 'data' contains the rows retrieved from the database
    // - 'pagination' includes the current page, total pages, and total number of items
    return {
      data,
      links,
      meta,
    };
  } catch (error) {
    logger.error("Error fetching naats:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.createNaatShareef = async ({
  slug,
  title_en,
  title_ur,
  category_id,
  is_published,
  track,
  filename,
  filepath,
  created_by,
}) => {
  try {
    const createNaatShareefPayload = {
      slug,
      title_en,
      title_ur,
      category_id,
      is_published,
      track,
      filename,
      filepath,
      created_by,
      created_at: new Date(),
    };

    return await naatModel.create(createNaatShareefPayload);
  } catch (error) {
    logger.error(`Error creating Naat Shareef: ${error.message}`);
    throw new Error(`Failed to create Naat Shareef: ${error.message}`);
  }
};

exports.updateNaatShareef = async ({
  id,
  slug,
  title_en,
  title_ur,
  category_id,
  is_published,
  track,
  filename,
  filepath,
  updated_by,
}) => {
  try {
    const categoryCheck = await naatModel.findByPk(id);
    if (!categoryCheck) {
      return {
        success: false,
        message: "Naat Shareef Data not found",
      };
    }

    const updateNaatShareefPayload = {
      slug,
      title_en,
      title_ur,
      category_id,
      is_published,
      track,
      filename,
      filepath,
      updated_by,
      updated_at: new Date(),
    };

    await naatModel.update(updateNaatShareefPayload, { where: { id } });
    return {
      success: true,
      message: "Naat Shareef updated successfully",
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error update Naat Shareef:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.getNaatShareefById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: "Invalid Naat Shareef ID provided",
      };
    }

    const naatShareef = await naatModel.findByPk(id);
    if (!naatShareef) {
      return {
        success: false,
        message: "Naat Shareef not found",
      };
    }

    return {
      success: true,
      data: naatShareef,
    };
  } catch (error) {
    logger.error("Error fetching Naat Shareef by ID:", error.message);
    throw new Error(`Failed to fetch Naat Shareef: ${error.message}`);
  }
};

exports.removeNaatShareef = async (naatShareef_id) => {
  try {
    // Check if the mehfil exists
    if (!naatShareef_id || isNaN(naatShareef_id)) {
      return {
        success: false,
        message: "Invalid Naat Shareef ID provided",
      };
    }

    const naatShareef = await naatModel.findByPk(naatShareef_id);
    if (!naatShareef) {
      return {
        success: true,
        message: "Naat Shareef data not found.",
      };
    }

    // Delete the mehfil
    await naatShareef.destroy();

    return {
      success: true,
      message: "Naat Shareef deleted successfully.",
    };
  } catch (error) {
    logger.error("Error deleting Naat Shareef:", error);
    throw error;
  }
};
