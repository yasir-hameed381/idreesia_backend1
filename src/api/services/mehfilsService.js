const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const mehfilsModel = require("../models/mehfils")(db);
const {
  paginate,
  constructPagination,
} = require("../services/utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

exports.getMehfils = async ({
  page = 1,
  limit = 25,
  search = "",
  startDate,
  endDate,
  requestUrl = "",
}) => {
  try {
    const searchFields = [
      SearchFields.ID,
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.DESCRIPTION,
      SearchFields.DESCRIPTION_EN,
      SearchFields.TYPE,
      SearchFields.FILENAME,
      SearchFields.FILEPATH,
      SearchFields.SLUG,
      SearchFields.TIME,
    ];

    // Use the pagination service to calculate offset, limit, and currentPage based on the given page and size
    const { offset, limit: qLimit, currentPage } = await paginate({ page, size: limit });

    // Initialize the 'where' object for query conditions
    const where = {};

    // Add search condition if 'search' is provided and there are fields to search in
    if (search && searchFields.length > 0) {
      // Dynamically generate a WHERE clause for the search fields using Sequelize's Op.like operator
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Perform a LIKE search with the search keyword
      }));
    }

    // Add date filters
    if (startDate || endDate) {
      if (startDate && endDate) {
        // Both dates provided: search for date range between them
        where.date = {
          [Op.gte]: startDate, // Greater than or equal to start date
          [Op.lte]: endDate, // Less than or equal to end date
        };
      } else if (startDate && !endDate) {
        // Only startDate provided: search for specific single date
        where.date = startDate;
      } else if (!startDate && endDate) {
        // Only endDate provided: search up to end date
        where.date = {
          [Op.lte]: endDate,
        };
      }
    }

    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved
    // - 'order' sorts by date descending (newest first)
    const { count, rows: data } = await mehfilsModel.findAndCountAll({
      where,
      offset,
      limit: qLimit,
      order: [
        ["date", "DESC"], // Primary sort: newest date first
        ["created_at", "DESC"], // Secondary sort: newest created first
      ],
    });

    const { links, meta } = constructPagination({
      count,
      limit: qLimit,
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
    logger.error("Error fetching mehfils:" + error.message);
    throw error; // Re-throw the error so it can be handled by the controller
  }
};

exports.createMehfil = async ({
  slug,
  title_en,
  title_ur,
  description,
  description_en,
  type,
  filename,
  filepath,
  time,
  date,
  is_published,
  old,
  is_for_karkun,
  is_for_ehad_karkun,
  is_sticky,
  created_by,
}) => {
  try {
    const createMehfilPayload = {
      slug,
      title_en,
      title_ur,
      description,
      description_en,
      type,
      filename,
      filepath,
      time,
      date,
      is_published,
      old,
      is_for_karkun,
      is_for_ehad_karkun,
      is_sticky,
      created_at: new Date(),
      created_by: created_by,
    };

    return await mehfilsModel.create(createMehfilPayload);
  } catch (error) {
    logger.error(`Error creating Mehfil: ${error.message}`);
    throw new Error(`Failed to create Mehfil: ${error.message}`);
  }
};

exports.updateMehfil = async ({
  id,
  slug,
  title_en,
  title_ur,
  description,
  description_en,
  type,
  filename,
  filepath,
  time,
  date,
  is_published,
  old,
  is_for_karkun,
  is_for_ehad_karkun,
  is_sticky,
  updated_by,
}) => {
  try {
    const mehfilCheck = await mehfilsModel.findByPk(id);
    if (!mehfilCheck) {
      return {
        success: false,
        message: "Mehfil Data not found",
      };
    }

    const updateMehfilPayload = {
      slug,
      title_en,
      title_ur,
      status: 1,
      description,
      description_en,
      type,
      filename,
      filepath,
      time,
      date,
      is_published,
      old,
      is_for_karkun,
      is_for_ehad_karkun,
      is_sticky,
      updated_at: new Date(),
      updated_by: updated_by,
    };

    await mehfilsModel.update(updateMehfilPayload, { where: { id } });
    return {
      success: true,
      message: "Mehfil updated successfully",
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error update Mehfil:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.removeMehfil = async (mehfil_id) => {
  try {
    // Check if the mehfil exists
    if (!mehfil_id || isNaN(mehfil_id)) {
      return {
        success: false,
        message: "Invalid Mehfil ID provided",
      };
    }

    const mehfil = await mehfilsModel.findByPk(mehfil_id);
    if (!mehfil) {
      return {
        success: true,
        message: "Mehfil data not found.",
      };
    }

    // Delete the mehfil
    await mehfil.destroy();

    return {
      success: true,
      message: "Mehfil deleted successfully.",
    };
  } catch (error) {
    logger.error("Error deleting Mehfil:", error);
    return next(error);
  }
};
