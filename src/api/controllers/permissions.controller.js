const logger = require("../../config/logger");
const permissionService = require("../services/permissionService");

exports.getPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getPermissions();
    return res.json(permissions);
  } catch (error) {
    logger.error("Error fetching permissions:", error);
    return next(error);
  }
};
