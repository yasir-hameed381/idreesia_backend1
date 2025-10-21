const logger = require("../../config/logger");
const mehfilsService = require("../services/mehfilsService");

exports.getMehfils = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search, startDate, endDate } = req.query;

    const result = await mehfilsService.getMehfils({
      page,
      size,
      search,
      startDate,
      endDate,
      requestUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching mehfils:", error);
    return next(error);
  }
};

exports.createMahfil = async (req, res, next) => {
  try {
    const {
      slug,
      title_en,
      title_ur,
      description,
      description_en,
      type,
      filename,
      filepath,
      time,
      date,
      is_published,
      old,
      created_by,
    } = req.body;

    const requiredFields = [
      "slug",
      "title_en",
      "title_ur",
      "description",
      "type",
      "description_en",
      "filepath",
      "time",
      "date",
      "filename",
      "created_by",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const result = await mehfilsService.createMehfil({
      slug,
      title_en,
      title_ur,
      description,
      description_en,
      type,
      filename,
      filepath,
      time,
      date,
      is_published,
      old,
      created_by,
    });
    return res.status(201).json({
      success: true,
      message: "Mehfil created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating Mehfil: ${error.message}`);
    return next(error);
  }
};

exports.updateMehfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      slug,
      title_en,
      title_ur,
      description,
      description_en,
      type,
      filename,
      filepath,
      time,
      date,
      is_published,
      old,
      updated_by,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Mehfil ID is required.",
      });
    }

    if (
      !slug ||
      !title_en ||
      !title_ur ||
      !description ||
      !description_en ||
      !type ||
      !filepath ||
      !time ||
      !date ||
      !filename
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: slug, title_en, and title_ur are required.",
      });
    }

    const result = await mehfilsService.updateMehfil({
      id,
      slug,
      title_en,
      title_ur,
      description,
      description_en,
      type,
      filename,
      filepath,
      time,
      date,
      is_published,
      old,
      updated_by,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Mehfil not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mehfil updated successfully.",
    });
  } catch (error) {
    logger.error(`Error updating Mehfil: ${error.message}`);
    return next(error);
  }
};

exports.removeMehfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await mehfilsService.removeMehfil(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting Mehfil:", error);
    return next(error);
  }
};
