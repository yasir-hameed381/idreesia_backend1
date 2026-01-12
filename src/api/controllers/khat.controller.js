const httpStatus = require("http-status");
const khatService = require("../services/khatService");
const logger = require("../../config/logger");

const buildRequestUrl = (req) => {
  if (!req) return "";
  return `${req.protocol}://${req.get("host")}${req.baseUrl}`;
};

exports.getKhats = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 25,
      search = "",
      zone_id,
      mehfil_directory_id,
      status,
      type,
      sortField,
      sortDirection,
    } = req.query;

    const response = await khatService.getKhats({
      page: Number(page) || 1,
      size: Number(size) || 25,
      search,
      zone_id: zone_id ? Number(zone_id) : undefined,
      mehfil_directory_id: mehfil_directory_id
        ? Number(mehfil_directory_id)
        : undefined,
      status,
      type,
      sortField,
      sortDirection,
      requestUrl: buildRequestUrl(req),
    });

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.getKhatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await khatService.getKhatById(id);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.createKhat = async (req, res, next) => {
  try {
    // Check if this is a public form submission with token
    const token = req.headers["x-khat-form-token"];
    if (token) {
      // Validate token before creating khat
      const tokenValidation = await khatService.validatePublicLinkToken(token);
      if (!tokenValidation.success || !tokenValidation.valid) {
        return res.status(400).json({
          success: false,
          message: tokenValidation.message || "Invalid or expired token",
        });
      }
      
      // Mark token as used after successful creation
      const response = await khatService.createKhat(req.body);
      await khatService.markTokenAsUsed(token);
      return res.status(httpStatus.CREATED).json(response);
    }
    
    const response = await khatService.createKhat(req.body);
    return res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.updateKhat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await khatService.updateKhat(id, req.body);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.updateKhatStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const response = await khatService.updateKhatStatus(id, status);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.deleteKhat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await khatService.deleteKhat(id);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
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

    const result = await khatService.generatePublicLinkToken({
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
    const publicUrl = `/${locale}/khatoot/form/${result.data.token}`;

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
    const result = await khatService.validatePublicLinkToken(token);

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error validating token: ${error.message}`, error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to validate token",
    });
  }
};

exports.markTokenAsUsed = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }
    
    const result = await khatService.markTokenAsUsed(token);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error marking token as used: ${error.message}`, error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark token as used",
    });
  }
};


