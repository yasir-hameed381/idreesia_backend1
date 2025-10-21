const { sequelize } = require("../../config/database");

// Import all models
const UserAdmin = require("./user-admin")(sequelize);
const Roles = require("./roles")(sequelize);
const Permissions = require("./permission")(sequelize);
const RoleHasPermissions = require("./roleHasPermissions")(sequelize);
const Auth = require("./auth")(sequelize);

// Create models object
const models = {
  UserAdmin,
  Roles,
  Permissions,
  RoleHasPermissions,
  Auth,
};

// Set up associations after all models are loaded
const setupAssociations = () => {
  // User-Role association
  if (UserAdmin.associate) {
    UserAdmin.associate(models);
  }

  // Role-Permission association
  if (Roles.associate) {
    Roles.associate(models);
  }

  // Permission-Role association (if needed)
  if (Permissions.associate) {
    Permissions.associate(models);
  }
};

// Setup associations
setupAssociations();

// Export models and sequelize
module.exports = Object.assign({ sequelize }, models);
