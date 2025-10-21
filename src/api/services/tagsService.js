const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const tagsModel = require("../models/tags")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

exports.getTags = async ({
  page = 1,
  size = 25,
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchFields = [SearchFields.NAME, SearchFields.NORMALIZED];
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
    const { count, rows: data } = await tagsModel.findAndCountAll({
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
    // Log any errors encountered during the process
    logger.error("Error fetching categories:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.getTagsById = async (id) => {
  try {
    const tag = await tagsModel.findByPk(id);

    if (!tag) {
      throw new Error("tag not found");
    }

    return tag;
  } catch (error) {
    logger.error("Error fetching tags by id: " + error.message);
    throw error;
  }
};

exports.createTag = async ({ name, normalized }) => {
  try {
    console.log("nameeeeeeeeeeee", name);
    console.log("normalized", normalized);
    const createTagPayload = {
      name,
      normalized,
      created_at: new Date(),
    };

    return await tagsModel.create(createTagPayload);
  } catch (error) {
    logger.error(`Error creating tag: ${error.message}`);
    throw new Error(`Failed to create tag: ${error.message}`);
  }
};

exports.updateTag = async ({ id, name, normalized }) => {
  try {
    const tagCheck = await tagsModel.findByPk(id);
    if (!tagCheck) {
      return {
        success: false,
        message: "Category not found",
      };
    }

    const updateTagPayload = {
      name,
      normalized,
      updated_at: new Date(),
    };

    await tagsModel.update(updateTagPayload, { where: { tag_id: id } });
    return {
      success: true,
      message: "Tag updated successfully",
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error update Tag:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.deleteTag = async (tag_id) => {
  try {
    // Check if the tag exists
    if (!tag_id || isNaN(tag_id)) {
      return {
        success: false,
        message: "Invalid tag ID provided",
      };
    }

    const tag = await tagsModel.findByPk(tag_id);
    if (!tag) {
      return {
        success: true,
        message: "Tag not found.",
      };
    }

    // Delete the tag
    await tag.destroy();

    return {
      success: true,
      message: "Tag deleted successfully.",
    };
  } catch (error) {
    logger.error("Error deleting tag:", error);
    return next(error);
  }
};
