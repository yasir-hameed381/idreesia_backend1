const logger = require("../../config/logger");
const naatService = require("../services/naatService");
const { SearchFields } = require("../Enums/searchEnums");

exports.getNaatShareefs = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const { page, size, category, search } = req.query;

    const result = await naatService.getNaatShareefs({
      page,
      size,
      category,
      search,
      requestUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching naat shareefs:", error);
    return next(error);
  }
};

exports.createNaatShareef = async (req, res, next) => {
  try {
    const {
      slug,
      title_en,
      title_ur,
      category_id,
      is_published,
      track,
      filename,
      filepath,
      created_by,
    } = req.body;

    if (
      !slug ||
      !title_en ||
      !title_ur ||
      !category_id ||
      !is_published ||
      !filename ||
      !filepath ||
      !track
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: slug, title_en, category_id ,is_published, filename, filepath ,track  and title_ur are required.",
      });
    }

    const result = await naatService.createNaatShareef({
      slug,
      title_en,
      title_ur,
      category_id,
      is_published,
      track,
      filename,
      filepath,
      created_by,
    });
    return res.status(201).json({
      success: true,
      message: "Mehfil created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating Naat Shareef: ${error.message}`);
    return next(error);
  }
};

exports.updateNaatShareef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      slug,
      title_en,
      title_ur,
      category_id,
      is_published,
      track,
      filename,
      filepath,
      updated_by,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Naat Shareef ID is required.",
      });
    }

    if (
      !slug ||
      !title_en ||
      !title_ur ||
      !category_id ||
      !filename ||
      !filepath ||
      !track
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: slug, title_en, category_id , filename, filepath ,track  and title_ur are required.",
      });
    }

    const result = await naatService.updateNaatShareef({
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
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Naat Shareef not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Naat Shareef updated successfully.",
    });
  } catch (error) {
    logger.error(`Error updating Naat Shareef: ${error.message}`);
    return next(error);
  }
};

exports.getNaatShareefById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Naat Shareef ID is required",
      });
    }

    const result = await naatService.getNaatShareefById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error fetching Naat Shareef by ID: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeNaatShareef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await naatService.removeNaatShareef(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting Naat Shareef:", error);
    return next(error);
  }
};
