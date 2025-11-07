const logger = require("../../config/logger");
const tarteebRequestsService = require("../services/tarteebRequestsService");

exports.getTarteebRequests = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search, status, zone_id } = req.query;

    const result = await tarteebRequestsService.getTarteebRequests({
      page,
      size,
      search,
      status,
      zone_id,
      requestUrl,
    });

    return res.json(result);
  } catch (error) {
    logger.error(`Error fetching tarteeb requests: ${error.message}`);
    return next(error);
  }
};

exports.getTarteebRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tarteeb request ID is required.",
      });
    }

    const result = await tarteebRequestsService.getTarteebRequestById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error(`Error fetching tarteeb request: ${error.message}`);
    return next(error);
  }
};

exports.createTarteebRequest = async (req, res, next) => {
  try {
    const result = await tarteebRequestsService.createTarteebRequest(req.body);

    return res.status(201).json({
      success: true,
      message: "Tarteeb request created successfully.",
      data: result.data,
    });
  } catch (error) {
    logger.error(`Error creating tarteeb request: ${error.message}`);
    return next(error);
  }
};

exports.updateTarteebRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tarteeb request ID is required.",
      });
    }

    const result = await tarteebRequestsService.updateTarteebRequest(id, req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error updating tarteeb request: ${error.message}`);
    return next(error);
  }
};

exports.deleteTarteebRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tarteeb request ID is required.",
      });
    }

    const result = await tarteebRequestsService.deleteTarteebRequest(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error deleting tarteeb request: ${error.message}`);
    return next(error);
  }
};

