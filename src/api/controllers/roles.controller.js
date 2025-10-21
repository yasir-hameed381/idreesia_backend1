const logger = require("../../config/logger");
const rolesService = require("../services/rolesService");

exports.createRole = async (req, res, next) => {
  try {
    const { name, guard_name, permissions } = req.body;

    const result = await rolesService.createRole({
      name,
      guard_name,
      permissions,
    });
    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating Role: ${error.message}`);
    return next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { name, guard_name, permissions } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    const result = await rolesService.updateRole({
      id,
      name,
      guard_name,
      permissions,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Role not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error updating Role: ${error.message}`);
    return next(error);
  }
};

exports.deleteRole = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    const result = await rolesService.deleteRole(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Role not found or delete failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting Role: ${error.message}`);
    return next(error);
  }
};

exports.getRoles = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search } = req.query;
    const result = await rolesService.getRoles({
      page,
      size,
      search,
      requestUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching Roles:", error);
    return next(error);
  }
};

exports.getRoleById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    const result = await rolesService.getRoleById(id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error fetching role by ID: ${error.message}`);
    return next(error);
  }
};
