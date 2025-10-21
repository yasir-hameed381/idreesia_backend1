const logger = require("../../config/logger");
const karkunJoinRequestService = require("../services/karkunJoinRequestService");

exports.createKarkunJoinRequest = async (req, res, next) => {
  try {
    const {
      avatar,
      first_name,
      last_name,
      email,
      phone_no,
      user_type,
      birth_year,
      ehad_year,
      zone_id,
      city,
      country,
      is_approved,
    } = req.body;

    const result = await karkunJoinRequestService.createKarkunJoinRequest({
      avatar,
      first_name,
      last_name,
      email,
      phone_no,
      user_type,
      birth_year,
      ehad_year,
      zone_id,
      city,
      country,
      is_approved,
    });

    return res.status(201).json({
      success: true,
      message: "Karkun join request created successfully.",
      data: result.data,
    });
  } catch (error) {
    logger.error(`Error creating karkun join request: ${error.message}`);
    return next(error);
  }
};

exports.getKarkunJoinRequests = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search } = req.query;

    const result = await karkunJoinRequestService.getKarkunJoinRequests({
      page,
      size,
      search,
      requestUrl,
    });

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching karkun join requests:", error);
    return next(error);
  }
};

exports.getKarkunJoinRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Karkun join request ID is required.",
        });
    }

    const result = await karkunJoinRequestService.getKarkunJoinRequestById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error(`Error fetching karkun join request: ${error.message}`);
    return next(error);
  }
};

exports.updateKarkunJoinRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Karkun join request ID is required.",
      });
    }

    const {
      avatar,
      first_name,
      last_name,
      email,
      phone_no,
      user_type,
      birth_year,
      ehad_year,
      zone_id,
      city,
      country,
      is_approved,
    } = req.body;

    const result = await karkunJoinRequestService.updateKarkunJoinRequest(id, {
      avatar,
      first_name,
      last_name,
      email,
      phone_no,
      user_type,
      birth_year,
      ehad_year,
      zone_id,
      city,
      country,
      is_approved,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error updating karkun join request: ${error.message}`);
    return next(error);
  }
};

exports.deleteKarkunJoinRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Karkun join request ID is required.",
      });
    }

    const result = await karkunJoinRequestService.deleteKarkunJoinRequest(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error deleting karkun join request: ${error.message}`);
    return next(error);
  }
};
