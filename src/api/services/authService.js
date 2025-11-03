const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../../config/logger');
const { sequelize: db } = require('../../config/database');
const userModel = require('../models/auth')(db);
const adminUserModel = require('../models/user-admin')(db);
const rolesModel = require('../models/roles')(db);
const permissionsModel = require('../models/permission')(db);
const roleHasPermissionsModel = require('../models/roleHasPermissions')(db);
const modelHasRolesModel = require('../models/modelHasRoles')(db);
const { jwtSecret } = require('../../config/vars');
const { ErrorMessages } = require('../Enums/errorMessages');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../../config/logger');
const { sequelize: db } = require('../../config/database');
const userModel = require('../models/auth')(db);
const adminUserModel = require('../models/user-admin')(db);
const rolesModel = require('../models/roles')(db);
const permissionsModel = require('../models/permission')(db);
const roleHasPermissionsModel = require('../models/roleHasPermissions')(db);
const modelHasRolesModel = require('../models/modelHasRoles')(db);
const { jwtSecret } = require('../../config/vars');
const { ErrorMessages } = require('../Enums/errorMessages');

// Set up associations manually
// Step 1: AdminUser -> model_has_roles (user.id = model_has_roles.model_id)
// Using constraints: false for polymorphic relationship
adminUserModel.belongsToMany(rolesModel, {
  through: {
    model: modelHasRolesModel,
    unique: false,
  },
  foreignKey: 'model_id',
  otherKey: 'role_id',
  as: 'roles',
  constraints: false,
// Step 1: AdminUser -> model_has_roles (user.id = model_has_roles.model_id)
// Using constraints: false for polymorphic relationship
adminUserModel.belongsToMany(rolesModel, {
  through: {
    model: modelHasRolesModel,
    unique: false,
  },
  foreignKey: 'model_id',
  otherKey: 'role_id',
  as: 'roles',
  constraints: false,
});

// Step 2: Roles -> role_has_permissions -> Permissions
// Step 2: Roles -> role_has_permissions -> Permissions
rolesModel.belongsToMany(permissionsModel, {
  through: roleHasPermissionsModel,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});

permissionsModel.belongsToMany(rolesModel, {
  through: roleHasPermissionsModel,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

exports.login = async (email, password) => {
  // Step 1: SELECT * FROM users where email = 'email@example.com'
  // Step 1: SELECT * FROM users where email = 'email@example.com'
  let user = await adminUserModel.findOne({
    where: { email },
    include: [
      {
        // Step 2: SELECT * FROM model_has_roles where model_id = user.id
        // Step 3: JOIN roles table using role_id
        // Step 2: SELECT * FROM model_has_roles where model_id = user.id
        // Step 3: JOIN roles table using role_id
        model: rolesModel,
        as: 'roles',
        through: {
          attributes: ['role_id', 'model_id', 'model_type'], // Show junction table for debugging
        },
        required: false, // LEFT JOIN instead of INNER JOIN
        as: 'roles',
        through: {
          attributes: ['role_id', 'model_id', 'model_type'], // Show junction table for debugging
        },
        required: false, // LEFT JOIN instead of INNER JOIN
        include: [
          {
            // Step 4: SELECT * FROM role_has_permissions WHERE role_id IN (roles)
            // Step 5: SELECT * FROM permissions WHERE id IN (permission_ids)
            // Step 4: SELECT * FROM role_has_permissions WHERE role_id IN (roles)
            // Step 5: SELECT * FROM permissions WHERE id IN (permission_ids)
            model: permissionsModel,
            as: 'permissions',
            through: {
              attributes: ['role_id', 'permission_id'], // Show junction table for debugging
            },
            required: false, // LEFT JOIN
            as: 'permissions',
            through: {
              attributes: ['role_id', 'permission_id'], // Show junction table for debugging
            },
            required: false, // LEFT JOIN
          },
        ],
      },
    ],
    logging: console.log, // Log the actual SQL query
    logging: console.log, // Log the actual SQL query
  });
  console.log('User fetched from adminUserModel:', JSON.stringify(user, null, 2));
  console.log('User fetched from adminUserModel:', JSON.stringify(user, null, 2));
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
  // Get first role (or you can return all roles if needed)
  const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;

  // Get first role (or you can return all roles if needed)
  const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    is_super_admin: user.is_super_admin || false,
    is_mehfil_admin: user.is_mehfil_admin || false,
    is_zone_admin: user.is_zone_admin || false,
    is_region_admin: user.is_region_admin || false,
    zone_id: user.zone_id || null,
    region_id: user.region_id || null,
    mehfil_directory_id: user.mehfil_directory_id || null,
    role: userRole
      ? {
        id: userRole.id,
        name: userRole.name,
        guard_name: userRole.guard_name,
        permissions: userRole.permissions
          ? userRole.permissions.map((p) => ({
            id: p.id,
            name: p.name,
            guard_name: p.guard_name,
          }))
          : [],
      }
      : null,
    // Optional: include all roles if user has multiple
    allRoles: user.roles
      ? user.roles.map((r) => ({
        id: r.id,
        name: r.name,
        guard_name: r.guard_name,
        permissions: r.permissions
          ? r.permissions.map((p) => ({
            id: p.id,
            name: p.name,
            guard_name: p.guard_name,
          }))
          : [],
      }))
      : [],
    // Optional: include all roles if user has multiple
    allRoles: user.roles
      ? user.roles.map((r) => ({
        id: r.id,
        name: r.name,
        guard_name: r.guard_name,
        permissions: r.permissions
          ? r.permissions.map((p) => ({
            id: p.id,
            name: p.name,
            guard_name: p.guard_name,
          }))
          : [],
      }))
      : [],
  };
  console.log('Prepared userData for token:', userData);
  console.log('Prepared userData for token:', userData);
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: userData.role,
    },
    jwtSecret,
    {
      expiresIn: expirationInSeconds,
    },
    },
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
    // Dynamic joins similar to SQL queries
    // Dynamic joins similar to SQL queries
    const user = await adminUserModel.findByPk(userId, {
      include: [
        {
          // SELECT * FROM model_has_roles where model_id = userId
          // SELECT * FROM model_has_roles where model_id = userId
          model: rolesModel,
          as: 'roles',
          through: {
            attributes: ['role_id', 'model_id', 'model_type'],
          },
          required: false,
          as: 'roles',
          through: {
            attributes: ['role_id', 'model_id', 'model_type'],
          },
          required: false,
          include: [
            {
              // SELECT * FROM role_has_permissions WHERE role_id IN (roles)
              // SELECT * FROM permissions WHERE id IN (permission_ids)
              // SELECT * FROM role_has_permissions WHERE role_id IN (roles)
              // SELECT * FROM permissions WHERE id IN (permission_ids)
              model: permissionsModel,
              as: 'permissions',
              through: {
                attributes: ['role_id', 'permission_id'],
              },
              required: false,
              as: 'permissions',
              through: {
                attributes: ['role_id', 'permission_id'],
              },
              required: false,
            },
          ],
        },
      ],
      logging: console.log,
      logging: console.log,
    });

    if (!user) {
      return null;
    }

    // Get first role (or return all roles)
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;

    // Get first role (or return all roles)
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      is_super_admin: user.is_super_admin || false,
      is_mehfil_admin: user.is_mehfil_admin || false,
      is_zone_admin: user.is_zone_admin || false,
      is_region_admin: user.is_region_admin || false,
      zone_id: user.zone_id || null,
      region_id: user.region_id || null,
      mehfil_directory_id: user.mehfil_directory_id || null,
      role: userRole
        ? {
          id: userRole.id,
          name: userRole.name,
          guard_name: userRole.guard_name,
          permissions: userRole.permissions
            ? userRole.permissions.map((p) => ({
              id: p.id,
              name: p.name,
              guard_name: p.guard_name,
            }))
            : [],
        }
        : null,
      // Optional: include all roles
      allRoles: user.roles
        ? user.roles.map((r) => ({
          id: r.id,
          name: r.name,
          guard_name: r.guard_name,
          permissions: r.permissions
            ? r.permissions.map((p) => ({
              id: p.id,
              name: p.name,
              guard_name: p.guard_name,
            }))
            : [],
        }))
        : [],
      // Optional: include all roles
      allRoles: user.roles
        ? user.roles.map((r) => ({
          id: r.id,
          name: r.name,
          guard_name: r.guard_name,
          permissions: r.permissions
            ? r.permissions.map((p) => ({
              id: p.id,
              name: p.name,
              guard_name: p.guard_name,
            }))
            : [],
        }))
        : [],
    };
  } catch (error) {
    logger.error('Error fetching user with permissions:', error);
    logger.error('Error fetching user with permissions:', error);
    throw error;
  }
};
