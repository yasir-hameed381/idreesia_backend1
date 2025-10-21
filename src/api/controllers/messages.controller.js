const logger = require("../../config/logger");
const { SearchFields } = require("../Enums/searchEnums");
const messagesService = require("../services/messagesService");

exports.getMessages = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const { page, size, search } = req.query;

    const result = await messagesService.getMessages({
      page,
      size,
      search,
      requestUrl,
    });
    
    // Debug logging
    logger.info(`Messages fetched: ${result?.data?.length || 0} records`);
    logger.info(`Result structure: ${JSON.stringify(Object.keys(result || {}))}`);
    
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching messages:", error);
    return next(error);
  }
};

// get by id
exports.getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await messagesService.getMessageById(id);

    return res.json({
      message: "Message fetched successfully",
      data: message,
    });
  } catch (error) {
    logger.error("Error fetching message by id:", error.message);
    return next(error);
  }
};

//  Create message
exports.createMessage = async (req, res, next) => {
  try {
    const payload = req.body;
    const newMessage = await messagesService.createMessage(payload);

    return res.status(201).json({
      message: "Message created successfully",
      data: newMessage,
    });
  } catch (error) {
    logger.error("Error creating message:", error.message);
    return next(error);
  }
};

//  Update message
exports.updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const updatedMessage = await messagesService.updateMessage(id, payload);

    return res.json({
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    logger.error("Error updating message:", error.message);
    return next(error);
  }
};

// Delete message
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await messagesService.deleteMessage(id);

    return res.json({
      message: result.message,
    });
  } catch (error) {
    logger.error("Error deleting message:", error.message);
    return next(error);
  }
};
