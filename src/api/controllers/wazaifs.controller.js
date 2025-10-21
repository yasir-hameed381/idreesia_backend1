const logger = require("../../config/logger");
const wazaifsService = require("../services/wazaifsService");
const { SearchFields } = require("../Enums/searchEnums");

exports.getWazaifs = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const { page, size, category, search } = req.query;

    const result = await wazaifsService.getWazaifs({
      page,
      size,
      category,
      search,
      requestUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching wazaif shareefs:", error);
    return next(error);
  }
};

exports.createWazaifShareef = async (req, res, next) => {
  try {
    const { slug, title_en, title_ur, description, images, created_by } =
      req.body;

    const requiredFields = [
      "slug",
      "title_en",
      "title_ur",
      "description",
      "images",
      "created_by",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    // const { slug, title_en, title_ur ,description ,images
    //  } = req.body;

    // if (!slug || !title_en || !title_ur || !description || !images) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Missing required fields: slug, title_en, description, images and title_ur are required.',
    //   });
    // }

    const result = await wazaifsService.createWazaifShareef({
      slug,
      title_en,
      title_ur,
      description,
      images,
      created_by,
    });
    return res.status(201).json({
      success: true,
      message: "Wazaif Shareef created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating WazaifShareef: ${error.message}`);
    return next(error);
  }
};

exports.updateWazaifShareef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slug, title_en, title_ur, description, images, updated_by } =
      req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Wazaif Shareef ID is required.",
      });
    }

    if (
      !slug ||
      !title_en ||
      !title_ur ||
      !description ||
      !images ||
      !updated_by
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: slug, title_en, and title_ur , description and images are required.",
      });
    }

    const result = await wazaifsService.updateWazaifShareef({
      id,
      slug,
      title_en,
      title_ur,
      description,
      images,
      updated_by,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Wazaif Shareef not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wazaif Shareef updated successfully.",
    });
  } catch (error) {
    logger.error(`Error updating Wazaif Shareef: ${error.message}`);
    return next(error);
  }
};

exports.removeWazaifShareef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await wazaifsService.removeWazaifShareef(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting Wazaif Shareef:", error);
    return next(error);
  }
};
