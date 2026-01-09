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
    const { token, ...requestData } = req.body;

    // If token is provided, validate it
    if (token) {
      const tokenValidation = await tarteebRequestsService.validatePublicLinkToken(token);
      
      if (!tokenValidation.success || !tokenValidation.valid) {
        return res.status(400).json({
          success: false,
          message: tokenValidation.message || "Invalid or expired token.",
        });
      }

      // Use zone_id and mehfil_directory_id from token if not provided in request
      if (tokenValidation.data.zone_id && !requestData.zone_id) {
        requestData.zone_id = tokenValidation.data.zone_id;
      }
      if (tokenValidation.data.mehfil_directory_id && !requestData.mehfil_directory_id) {
        requestData.mehfil_directory_id = tokenValidation.data.mehfil_directory_id;
      }

      // Create the request
      const createResult = await tarteebRequestsService.createTarteebRequest(requestData);
      
      // Check if creation failed due to validation
      if (!createResult.success) {
        return res.status(400).json({
          success: false,
          message: createResult.message || "Failed to create tarteeb request.",
        });
      }
      
      // Mark token as used after successful creation
      await tarteebRequestsService.markTokenAsUsed(token);

      return res.status(201).json({
        success: true,
        message: "Tarteeb request created successfully.",
        data: createResult.data,
      });
    }

    // Regular creation without token
    const result = await tarteebRequestsService.createTarteebRequest(requestData);

    // Check if creation failed due to validation
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to create tarteeb request.",
      });
    }

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
      // Check if it's a validation error (400) or not found error (404)
      const statusCode = result.message && result.message.includes("does not exist") ? 400 : 404;
      return res.status(statusCode).json(result);
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

exports.generatePublicLink = async (req, res, next) => {
  try {
    const { linkExpiryHours, zone_id, mehfil_directory_id } = req.body;
    const createdBy = req.user?.id || null;

    if (!linkExpiryHours || linkExpiryHours < 1 || linkExpiryHours > 720) {
      return res.status(400).json({
        success: false,
        message: "Link expiry hours must be between 1 and 720.",
      });
    }

    const result = await tarteebRequestsService.generatePublicLinkToken({
      linkExpiryHours,
      createdBy,
      zoneId: zone_id || null,
      mehfilDirectoryId: mehfil_directory_id || null,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Generate the public URL (use frontend URL from env or request origin)
    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    
    // Include locale in the URL (default to 'en' if not specified)
    const locale = process.env.DEFAULT_LOCALE || 'en';
    const publicUrl = `/${locale}/tarteeb-request/form/${result.data.token}`;


    return res.status(200).json({
      success: true,
      data: {
        token: result.data.token,
        url: publicUrl,
        expires_at: result.data.expires_at,
      },
    });
  } catch (error) {
    logger.error(`Error generating public link: ${error.message}`, error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate public link",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

exports.validateToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Token is required.",
      });
    }

    const result = await tarteebRequestsService.validatePublicLinkToken(token);

    if (!result.success || !result.valid) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error validating token: ${error.message}`);
    return next(error);
  }
};

