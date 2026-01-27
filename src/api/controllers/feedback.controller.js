const logger = require("../../config/logger");
const feedbackService = require("../services/feedbackService");

//  Create Feedback
exports.createFeedback = async (req, res, next) => {
  try {
    const { name, contact_no, type, app_type, subject, description, screenshot, is_resolved } =
      req.body;

    const result = await feedbackService.createFeedback({
      name,
      contact_no,
      type,
      app_type,
      subject,
      description,
      screenshot,
      is_resolved,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating feedback: ${error.message}`);
    return next(error);
  }
};

//  Get All Feedback
exports.getFeedback = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search, statusFilter } = req.query;

    const result = await feedbackService.getFeedback({
      page,
      size,
      search,
      statusFilter: statusFilter || 'all',
      requestUrl,
    });

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching feedback:", error);
    return next(error);
  }
};

//  Get Feedback By ID
exports.getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required",
      });
    }

    const result = await feedbackService.getFeedbackById(id);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching feedback by id: " + error.message);
    return next(error);
  }
};

//  Update Feedback
exports.updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact_no, type, app_type, subject, description, screenshot, is_resolved } =
      req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required.",
      });
    }

    const result = await feedbackService.updateFeedback(id, {
      name,
      contact_no,
      type,
      app_type: req.body.app_type,
      subject,
      description,
      screenshot,
      is_resolved: req.body.is_resolved,
    });

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully.",
      data: result,
    });
  } catch (error) {
    logger.error(`Error updating feedback: ${error.message}`);
    return next(error);
  }
};

//  Delete Feedback
exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required",
      });
    }

    const result = await feedbackService.deleteFeedback(id);

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error deleting feedback: ${error.message}`);
    return next(error);
  }
};
