const logger = require("../../config/logger");

const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const messagesModel = require("../models/messages")(db);
const {
  paginate,
  constructPagination,
} = require("../services/utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

exports.getMessages = async ({
  page = 1,
  size = 25,
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchFields = [
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.DESCRIPTION,
      SearchFields.FILENAME,
      SearchFields.TRACK,
    ];
    // Use the pagination service to calculate offset, limit, and currentPage
    // Based on the provided 'page' and 'size' parameters
    const { offset, limit, currentPage } = await paginate({ page, size });

    // Initialize the 'where' object for query filtering conditions
    const where = {};

    // Check if 'search' is provided and there are fields to search in
    if (search && searchFields.length > 0) {
      // Dynamically generate the WHERE clause for the search
      // Use Sequelize's Op.or to search across multiple fields
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Perform a partial match using LIKE
      }));
    }

    // Use Sequelize's findAndCountAll method to retrieve data with pagination
    // - 'where' applies the filtering conditions
    // - 'offset' skips records for pagination
    // - 'limit' specifies the number of records to fetch
    const { count, rows: data } = await messagesModel.findAndCountAll({
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
    // Log any errors encountered during the process for debugging purposes
    logger.error("Error fetching messages:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.getMessageById = async (id) => {
  try {
    const message = await messagesModel.findByPk(id);

    if (!message) {
      throw new Error("Message not found");
    }

    return message;
  } catch (error) {
    logger.error("Error fetching message by id: " + error.message);
    throw error;
  }
};

// Create a new message
exports.createMessage = async (payload) => {
  try {
    const newMessage = await messagesModel.create({
      title_en: payload.title_en,
      title_ur: payload.title_ur,
      description_en: payload.description_en || null,
      description_ur: payload.description_ur || null,
      is_published: payload.is_published ?? 0,
      at_top: payload.at_top ?? null,
      show_notice: payload.show_notice ?? null,
      created_by: payload.created_by,
      updated_by: payload.updated_by,
      created_at: new Date(),
      updated_at: new Date(),
      link_1_id: payload.link_1_id ?? null,
      link_1_category_id: payload.link_1_category_id ?? null,
      link_2_id: payload.link_2_id ?? null,
      link_2_category_id: payload.link_2_category_id ?? null,
      link_3_id: payload.link_3_id ?? null,
      link_3_category_id: payload.link_3_category_id ?? null,
      link_4_id: payload.link_4_id ?? null,
      link_4_category_id: payload.link_4_category_id ?? null,
      wazaif_id: payload.wazaif_id ?? null,
    });

    return newMessage;
  } catch (error) {
    logger.error("Error creating message: " + error.message);
    throw error;
  }
};

//Update an message
exports.updateMessage = async (id, payload) => {
  try {
    const [updatedRows] = await messagesModel.update(
      {
        title_en: payload.title_en,
        title_ur: payload.title_ur,
        description_en: payload.description_en || null,
        description_ur: payload.description_ur || null,
        is_published: payload.is_published,
        at_top: payload.at_top,
        show_notice: payload.show_notice,
        updated_by: payload.updated_by,
        updated_at: new Date(),
        link_1_id: payload.link_1_id,
        link_1_category_id: payload.link_1_category_id,
        link_2_id: payload.link_2_id,
        link_2_category_id: payload.link_2_category_id,
        link_3_id: payload.link_3_id,
        link_3_category_id: payload.link_3_category_id,
        link_4_id: payload.link_4_id,
        link_4_category_id: payload.link_4_category_id,
        wazaif_id: payload.wazaif_id,
      },
      {
        where: { id },
      }
    );

    if (updatedRows === 0) {
      throw new Error("Message not found or no changes made");
    }

    return await messagesModel.findByPk(id); // return updated row
  } catch (error) {
    logger.error("Error updating message: " + error.message);
    throw error;
  }
};

// Delete a message
exports.deleteMessage = async (id) => {
  try {
    const deletedRows = await messagesModel.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Message not found");
    }

    return { message: "Message deleted successfully" };
  } catch (error) {
    logger.error("Error deleting message: " + error.message);
    throw error;
  }
};
