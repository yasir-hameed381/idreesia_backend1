const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const feedbackModel = require("../models/feedback")(db);

//  Create Feedback
exports.createFeedback = async (payload) => {
  try {
    const feedback = await feedbackModel.create({
      name: payload.name,
      contact_no: payload.contact_no || null,
      type: payload.type || null,
      app_type: payload.app_type || 'idreesia_app',
      subject: payload.subject || null,
      description: payload.description || null,
      screenshot: payload.screenshot || null,
      is_resolved: payload.is_resolved || false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return feedback;
  } catch (error) {
    logger.error("Error creating feedback: " + error.message);
    throw error;
  }
};

//  Update Feedback
exports.updateFeedback = async (id, payload) => {
  try {
    const [updatedRows] = await feedbackModel.update(
      {
        name: payload.name,
        contact_no: payload.contact_no,
        type: payload.type,
        app_type: payload.app_type,
        subject: payload.subject,
        description: payload.description,
        screenshot: payload.screenshot,
        is_resolved: payload.is_resolved !== undefined ? payload.is_resolved : false,
        updated_at: new Date(),
      },
      { where: { id } }
    );

    if (updatedRows === 0)
      throw new Error("Feedback not found or no changes made");

    return await feedbackModel.findByPk(id);
  } catch (error) {
    logger.error("Error updating feedback: " + error.message);
    throw error;
  }
};

exports.getFeedback = async ({
  page = 1,
  size = 10,
  search = "",
  statusFilter = "all",
  requestUrl,
}) => {
  try {
    const limit = parseInt(size);
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Add search conditions
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { contact_no: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Add status filter
    if (statusFilter === 'resolved') {
      whereClause.is_resolved = true;
    } else if (statusFilter === 'pending') {
      whereClause.is_resolved = false;
    }

    const { count, rows } = await feedbackModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        pageSize: limit,
        requestUrl,
      },
    };
  } catch (error) {
    throw error;
  }
};

// Get Feedback by ID
exports.getFeedbackById = async (id) => {
  try {
    const feedback = await feedbackModel.findByPk(id);
    if (!feedback) throw new Error("Feedback not found");
    return feedback;
  } catch (error) {
    logger.error("Error fetching feedback by id: " + error.message);
    throw error;
  }
};

//  Delete Feedback
exports.deleteFeedback = async (id) => {
  try {
    const deletedRows = await feedbackModel.destroy({ where: { id } });
    if (deletedRows === 0) throw new Error("Feedback not found");

    return { message: "Feedback deleted successfully" };
  } catch (error) {
    logger.error("Error deleting feedback: " + error.message);
    throw error;
  }
};
