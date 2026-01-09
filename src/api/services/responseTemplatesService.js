const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const { paginate, constructPagination } = require("./utilityServices");

const ResponseTemplateModel = require("../models/responseTemplates")(db);

exports.getResponseTemplates = async ({
  page = 1,
  size = 25,
  search = "",
  sortField = "created_at",
  sortDirection = "desc",
  requestUrl = "",
}) => {
  try {
    const { offset, limit, currentPage } = await paginate({ page, size });

    const where = {};

    // Search by title
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    // Sortable fields
    const sortableFields = ["id", "title", "created_at", "updated_at"];
    const normalizedSortField = sortableFields.includes(sortField)
      ? sortField
      : "created_at";
    const normalizedSortDirection =
      typeof sortDirection === "string" && sortDirection.toLowerCase() === "asc"
        ? "ASC"
        : "DESC";

    const { count, rows: data } = await ResponseTemplateModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [[normalizedSortField, normalizedSortDirection]],
    });

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    return {
      success: true,
      data,
      links,
      meta,
    };
  } catch (error) {
    logger.error(`Error fetching response templates: ${error.message}`, {
      stack: error.stack,
    });
    throw error;
  }
};

exports.getResponseTemplateById = async (id) => {
  try {
    const template = await ResponseTemplateModel.findByPk(id);

    if (!template) {
      return {
        success: false,
        message: "Response template not found.",
      };
    }

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    logger.error(`Error fetching response template by id: ${error.message}`);
    throw error;
  }
};

exports.createResponseTemplate = async (payload) => {
  try {
    const templatePayload = {
      title: payload.title,
      jawab: payload.jawab || null,
      jawab_links: payload.jawab_links || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const template = await ResponseTemplateModel.create(templatePayload);

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    logger.error(`Error creating response template: ${error.message}`);
    throw error;
  }
};

exports.updateResponseTemplate = async (id, payload) => {
  try {
    const templatePayload = {
      title: payload.title,
      jawab: payload.jawab || null,
      jawab_links: payload.jawab_links || null,
      updated_at: new Date(),
    };

    const [affectedRows] = await ResponseTemplateModel.update(templatePayload, {
      where: { id },
    });

    if (!affectedRows) {
      return {
        success: false,
        message: "Response template not found or update failed.",
      };
    }

    const updatedTemplate = await ResponseTemplateModel.findByPk(id);

    return {
      success: true,
      data: updatedTemplate,
      message: "Response template updated successfully.",
    };
  } catch (error) {
    logger.error(`Error updating response template: ${error.message}`);
    throw error;
  }
};

exports.deleteResponseTemplate = async (id) => {
  try {
    const deleted = await ResponseTemplateModel.destroy({
      where: { id },
    });

    if (!deleted) {
      return {
        success: false,
        message: "Response template not found or delete failed.",
      };
    }

    return {
      success: true,
      message: "Response template deleted successfully.",
    };
  } catch (error) {
    logger.error(`Error deleting response template: ${error.message}`);
    throw error;
  }
};

