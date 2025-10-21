const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const userModel = require("../models/auth")(db);
const adminUserModel = require("../models/user-admin")(db);
const rolesModel = require("../models/roles")(db);
const permissionsModel = require("../models/permission")(db);
const roleHasPermissionsModel = require("../models/roleHasPermissions")(db);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/vars");
const { ErrorMessages } = require("../Enums/errorMessages");

// Set up associations manually
adminUserModel.belongsTo(rolesModel, {
  foreignKey: "id",
  as: "role",
});

rolesModel.belongsToMany(permissionsModel, {
  through: roleHasPermissionsModel,
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
});

permissionsModel.belongsToMany(rolesModel, {
  through: roleHasPermissionsModel,
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
});

exports.login = async (email, password) => {
  // First try to find user in admin users table
  let user = await adminUserModel.findOne({
    where: { email },
    include: [
      {
        model: rolesModel,
        as: "role",
        include: [
          {
            model: permissionsModel,
            through: roleHasPermissionsModel,
            as: "permissions",
          },
        ],
      },
    ],
  });

  // If not found in admin users, try auth table
  if (!user) {
    user = await userModel.findOne({ where: { email } });
  }

  if (!user) {
    const error = new Error(ErrorMessages.NOT_FOUND);
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error(ErrorMessages.INVALID_EMAIL_PASSWORD);
    error.statusCode = 400;
    throw error;
  }

  const expirationInSeconds = 24 * 60 * 60; // 24 hours in seconds

  // Prepare user data with roles and permissions
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    is_super_admin: user.is_super_admin || false,
    is_mehfil_admin: user.is_mehfil_admin || false,
    is_zone_admin: user.is_zone_admin || false,
    is_region_admin: user.is_region_admin || false,
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          guard_name: user.role.guard_name,
          permissions: user.role.permissions
            ? user.role.permissions.map((p) => ({
                id: p.id,
                name: p.name,
                guard_name: p.guard_name,
              }))
            : [],
        }
      : null,
  };

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: userData.role,
    },
    jwtSecret,
    {
      expiresIn: expirationInSeconds,
    }
  );

  return {
    user: userData,
    token,
    message: ErrorMessages.SUCCESS_LOGIN,
  };
};

exports.register = async (email, password, name) => {
  // Check if the email already exists
  const existingUser = await userModel.findOne({ where: { email } });

  if (existingUser) {
    const error = new Error(ErrorMessages.EMAIL_EXIST);
    error.statusCode = 400;
    throw error;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 9);

  // Create the new user
  const newUser = await userModel.create({
    email,
    password: hashedPassword,
    name,
  });

  logger.info(ErrorMessages.USER_REGISTER_SUCCESS, { email, name });

  return {
    user: newUser,
    message: ErrorMessages.REGISTRATION_SUCCESS,
  };
};

// Get user with roles and permissions
exports.getUserWithPermissions = async (userId) => {
  try {
    const user = await adminUserModel.findByPk(userId, {
      include: [
        {
          model: rolesModel,
          as: "role",
          include: [
            {
              model: permissionsModel,
              through: roleHasPermissionsModel,
              as: "permissions",
            },
          ],
        },
      ],
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      is_super_admin: user.is_super_admin || false,
      is_mehfil_admin: user.is_mehfil_admin || false,
      is_zone_admin: user.is_zone_admin || false,
      is_region_admin: user.is_region_admin || false,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            guard_name: user.role.guard_name,
            permissions: user.role.permissions
              ? user.role.permissions.map((p) => ({
                  id: p.id,
                  name: p.name,
                  guard_name: p.guard_name,
                }))
              : [],
          }
        : null,
    };
  } catch (error) {
    logger.error("Error fetching user with permissions:", error);
    throw error;
  }
};
