const logger = require("../../config/logger");
const zoneService = require("../services/zonesService");

exports.getZones = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search } = req.query;
    const result = await zoneService.getZones({
      page,
      size,
      search,
      requestUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching Zones:", error);
    return next(error);
  }
};

exports.createZone = async (req, res, next) => {
  try {
    const {
      titleEn,
      titleUr,
      description,
      countryEn,
      countryUr,
      cityEn,
      cityUr,
      co,
      primaryPhoneNumber,
      secondaryPhoneNumber,
    } = req.body;

    const requiredFields = [
      "titleEn",
      "titleUr",
      "countryEn",
      "countryUr",
      "cityEn",
      "cityUr",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const result = await zoneService.createZone({
      titleEn,
      titleUr,
      description,
      countryEn,
      countryUr,
      cityEn,
      cityUr,
      co,
      primaryPhoneNumber,
      secondaryPhoneNumber,
    });
    return res.status(201).json({
      success: true,
      message: "Zone created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating zone: ${error.message}`);
    return next(error);
  }
};

exports.updateZone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      titleEn,
      titleUr,
      description,
      countryEn,
      countryUr,
      cityEn,
      cityUr,
      co,
      primaryPhoneNumber,
      secondaryPhoneNumber,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Zone ID is required.",
      });
    }

    const requiredFields = [
      "titleEn",
      "titleUr",
      "countryEn",
      "countryUr",
      "cityEn",
      "cityUr",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const result = await zoneService.updateZone({
      id,
      titleEn,
      titleUr,
      description,
      countryEn,
      countryUr,
      cityEn,
      cityUr,
      co,
      primaryPhoneNumber,
      secondaryPhoneNumber,
    });

    if (!result || !result.success) {
      return res.status(404).json({
        success: false,
        message: "Zone not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Zone updated successfully.",
    });
  } catch (error) {
    logger.error(`Error updating Zone: ${error.message}`);
    return next(error);
  }
};

exports.deleteZone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await zoneService.deleteZone(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error deleting Zone:", error);
    return next(error);
  }
};

exports.getZoneById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await zoneService.getZoneById(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching Zone:", error);
    return next(error);
  }
};

// Get zone data for PDF export
exports.getZoneForPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await zoneService.getZoneForPdf(id);
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching zone for PDF:", error);
    return next(error);
  }
};

// Generate and download PDF
exports.downloadZonePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await zoneService.generateZonePdf(id);

    const filename = `zone_${id}_${new Date().toISOString().split("T")[0]}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.send(pdfBuffer);
  } catch (error) {
    logger.error("Error generating zone PDF:", error);
    return next(error);
  }
};
