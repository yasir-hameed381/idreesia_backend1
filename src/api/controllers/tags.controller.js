const logger = require("../../config/logger");
const tagsService = require("../services/tagsService");

exports.getTags = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search } = req.query;
    const result = await tagsService.getTags({
      page,
      size,
      search,
      requestUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching tags:", error);
    return next(error);
  }
};

exports.getTagsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await tagsService.getTagsById(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching tags:", error);
    return next(error);
  }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name, normalized } = req.body;

    if (!name || !normalized) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, normalized are required.",
      });
    }

    const result = await tagsService.createTag({ name, normalized });
    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    return next(error);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, normalized } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tag ID is required.",
      });
    }

    if (!name || !normalized) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, normalized are required.",
      });
    }

    const result = await tagsService.updateTag({ id, name, normalized });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Tag not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tag updated successfully.",
    });
  } catch (error) {
    logger.error(`Error updating tag: ${error.message}`);
    return next(error);
  }
};

exports.deleteTags = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await tagsService.deleteTag(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting Tags:", error);
    return next(error);
  }
};
