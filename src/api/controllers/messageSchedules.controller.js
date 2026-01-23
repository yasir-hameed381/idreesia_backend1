const logger = require("../../config/logger");
const messageSchedulesService = require("../services/messageSchedulesService");

exports.createMessageSchedule = async (req, res, next) => {
  try {
    const payload = req.body;
    const newSchedule = await messageSchedulesService.createMessageSchedule(payload);

    return res.status(201).json({
      success: true,
      message: "Message schedule created successfully",
      data: newSchedule,
    });
  } catch (error) {
    logger.error("Error creating message schedule:", error);
    if (error.message === "Message not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

exports.getMessageSchedules = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, message_id } = req.query;

    const result = await messageSchedulesService.getMessageSchedules({
      page,
      size,
      message_id,
      requestUrl,
    });

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching message schedules:", error);
    return next(error);
  }
};

exports.getMessageScheduleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await messageSchedulesService.getMessageScheduleById(id);

    return res.json({
      success: true,
      message: "Message schedule fetched successfully",
      data: schedule,
    });
  } catch (error) {
    logger.error("Error fetching message schedule by id:", error.message);
    if (error.message === "Message schedule not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

exports.updateMessageSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const updatedSchedule = await messageSchedulesService.updateMessageSchedule(id, payload);

    return res.json({
      success: true,
      message: "Message schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    logger.error("Error updating message schedule:", error);
    if (error.message === "Message schedule not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

exports.deleteMessageSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await messageSchedulesService.deleteMessageSchedule(id);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error("Error deleting message schedule:", error);
    if (error.message === "Message schedule not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};
