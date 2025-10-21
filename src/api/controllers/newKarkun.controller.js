const logger = require("../../config/logger");
const karkunService = require("./../services/newKarkunService");

// Create Karkun
exports.createKarkun = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging line
    const data = await karkunService.createKarkun(req.body);
    console.log("Created Karkun:", data); // Debugging line
    return res.status(201).json({
      success: true,
      message: "Karkun created successfully",
      data,
    });
  } catch (error) {
    logger.error(`Error creating Karkun: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Karkuns (with pagination + search)
exports.getKarkuns = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const requestUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const result = await karkunService.getKarkuns({
      page,
      size,
      search,
      requestUrl,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(`Error fetching Karkuns: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Karkun by ID
exports.getKarkunById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await karkunService.getKarkunById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error fetching Karkun by ID: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Karkun
exports.updateKarkun = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await karkunService.updateKarkun({ id, ...req.body });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error updating Karkun: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Karkun
exports.deleteKarkun = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await karkunService.deleteKarkun(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error deleting Karkun: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
