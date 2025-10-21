const logger = require("../../config/logger");
const tabarukatService = require("./../services/tabarukatService");

// Create Tabarukat
exports.createTabarukat = async (req, res) => {
  try {
    const data = await tabarukatService.createTabarukat(req.body);
    return res.status(201).json({
      success: true,
      message: "Tabarukat created successfully",
      data,
    });
  } catch (error) {
    logger.error(`Error creating Tabarukat: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Tabarukat (with pagination & search)
exports.getTabarukat = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const requestUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const result = await tabarukatService.getTabarukat({
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
    logger.error(`Error fetching Tabarukat: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Tabarukat by ID
exports.getTabarukatById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tabarukatService.getTabarukatById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error fetching Tabarukat by ID: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Tabarukat
exports.updateTabarukat = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tabarukatService.updateTabarukat({ id, ...req.body });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error updating Tabarukat: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Tabarukat
exports.deleteTabarukat = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tabarukatService.deleteTabarukat(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error deleting Tabarukat: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
