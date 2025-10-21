const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const permissionSchema = require("../models/permission")(db);

exports.getPermissions = async () => {
  try {
    const permissions = await permissionSchema.findAll();
    return permissions;
  } catch (error) {
    logger.error("Error fetching permissions: " + error.message);
    throw error;
  }
};
