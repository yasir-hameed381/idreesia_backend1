const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const naatModel = require("../models/naat")(db);
const {
  paginate,
  constructPagination,
} = require("../services/utilityServices");
const { SearchFields } = require("../Enums/searchEnums");
const { Category } = require("../Enums/catgoryEnums");

exports.getNaatShareefs = async ({
  page = 1,
  size = 25,
  category = "",
  search = "",
  requestUrl = "",
}) => {
  try {
    const allowedCategories = [
      Category.ALL_NAAT_SHAREEF,
      Category.NEW_NAAT_SHAREEF,
      Category.OLD_NAAT_SHAREEF,
    ]; // Allowed category values

    // Validate the category parameter (empty string is allowed, treated as 'all')
    if (category && !allowedCategories.includes(category.toLowerCase())) {
      return {
        success: false,
        error: `Invalid category. Allowed categories are: ${allowedCategories.join(
          ","
        )}`,
      };
    }

    const searchFields = [
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.FILENAME,
      SearchFields.FILEPATH,
      SearchFields.TRACK,
      SearchFields.CREATED_AT,
    ];

    const { offset, limit, currentPage } = await paginate({ page, size });

    const where = {};

    // if (search && searchFields.length > 0) {
    //   where[Op.or] = searchFields.map((field) => ({
    //     [field]: { [Op.like]: `%${search}%` },
    //   }));
    // }

    if (category && category.toLowerCase() !== "all") {
      where.category_id = category;
    }

    const isDateSearch = !isNaN(Date.parse(search));
    console.log("isDateSearch,isDateSearch", isDateSearch);
    if (search && searchFields.length > 0) {
      where[Op.or] = searchFields.map((field) => {
        if (field === SearchFields.CREATED_AT && isDateSearch) {
          const start = new Date(search);
          const end = new Date(start);
          end.setDate(start.getDate() + 1);
          return {
            [field]: {
              [Op.between]: [start, end],
            },
          };
        } else {
          return {
            [field]: { [Op.like]: `%${search}%` },
          };
        }
      });
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
