const { Op, where } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");
const rolesModel = require("../models/roles")(db);
const permissionsModel = require("../models/permission")(db);
const roleHasPermissionsModel = require("../models/roleHasPermissions")(db);

// Manually set up associations
rolesModel.belongsToMany(permissionsModel, {
  through: "role_has_permissions",
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
});

permissionsModel.belongsToMany(rolesModel, {
  through: "role_has_permissions",
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
});

exports.createRole = async ({ name, guard_name = "web", permissions = [] }) => {
  const transaction = await db.transaction();
  try {
    // 1. Create the role
    const role = await rolesModel.create(
      {
        name,
        guard_name,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    );

    // 2. If permissions exist, insert into role_has_permissions
    if (Array.isArray(permissions) && permissions.length > 0) {
      const rolePermissions = permissions.map((permissionId) => ({
        role_id: role.id,
        permission_id: permissionId,
      }));

      await roleHasPermissionsModel.bulkCreate(rolePermissions, {
        transaction,
      });
    }

    await transaction.commit();

    return {
      id: role.id,
      name: role.name,
      guard_name: role.guard_name,
      permissions,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error creating role: ${error.message}`);
    throw new Error(`Failed to create role: ${error.message}`);
  }
};

exports.updateRole = async ({
  id,
  name,
  guard_name = "web",
  permissions = [],
}) => {
  const transaction = await db.transaction();
  try {
    //1. find role by id
    const role = await rolesModel.findByPk(id);
    if (!role) {
      return { success: false, message: "Role does not exsist." };
    }
    // 2. update that role
    role.name = name;
    role.guard_name = guard_name;
    role.updated_at = new Date();

    await role.save({ transaction });
    //3. delete the role permission relation in role_has_permission tabel
    await roleHasPermissionsModel.destroy({
      where: { role_id: id },
      transaction,
    });
    // 4.  insert new permissions if provided
    if (Array.isArray(permissions) && permissions.length > 0) {
      const rolePermissions = permissions.map((permissionId) => ({
        role_id: role.id,
        permission_id: permissionId,
      }));

      await roleHasPermissionsModel.bulkCreate(rolePermissions, {
        transaction,
      });
    }
    //5.commit the transaction
    await transaction.commit();

    return {
      id: role.id,
      name: role.name,
      guard_name: role.guard_name,
      permissions,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error updating role: ${error.message}`);
    throw new Error(`Failed to upadte role: ${error.message}`);
  }
};

exports.deleteRole = async (id) => {
  const transaction = await db.transaction();
  try {
    //1. find role by id
    const role = await rolesModel.findByPk(id);
    if (!role) {
      return { success: false, message: "Role does not exsist." };
    }
    //2. delete role form roles tabel
    await role.destroy({ transaction });

    //3. delete the role permission relation in role_has_permission tabel
    await roleHasPermissionsModel.destroy({
      where: { role_id: id },
      transaction,
    });
    //4.commit the transaction
    await transaction.commit();

    return {
      success: true,
      message: "Role deleted sucessfully",
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error deleting role: ${error.message}`);
    throw new Error(`Failed to delete role: ${error.message}`);
  }
};

exports.getRoles = async ({
  page = 1,
  size = 50,
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchFields = [SearchFields.NAME];
    // Use the pagination service to calculate offset, limit, and currentPage based on the given page and size
    const { offset, limit, currentPage } = await paginate({ page, size });

    // Initialize the 'where' object for query conditions
    const where = {};

    // Add search condition if 'search' is provided and there are fields to search in
    if (search && searchFields.length > 0) {
      // Dynamically generate a WHERE clause for the search fields using Sequelize's Op.like operator
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Perform a LIKE search with the search keyword
      }));
    }

    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved

    // Fetch roles WITH permissions
    const { count, rows: data } = await rolesModel.findAndCountAll({
      where,
      offset,
      limit,
      attributes: ["id", "name", "created_at", "updated_at"], // only required fields
      include: [
        {
          model: permissionsModel,
          as: "permissions",
          attributes: ["id", "name"], // fetch only needed permission info
          through: { attributes: [] }, // hide pivot table fields
        },
      ],
    });

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    // Return the data and pagination details
    // - 'data' contains the rows retrieved from the database
    // - 'pagination' includes the current page, total pages, and total number of items
    return {
      data,
      links,
      meta,
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error fetching Roles:" + error.message);
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }
};

exports.getRoleById = async (id) => {
  try {
    const role = await rolesModel.findByPk(id, {
      attributes: ["id", "name", "guard_name", "created_at", "updated_at"],
      include: [
        {
          model: permissionsModel,
          as: "permissions",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      throw new Error("Role not found");
    }

    return role;
  } catch (error) {
    logger.error(`Error fetching role by ID: ${error.message}`);
    throw new Error(`Failed to fetch role: ${error.message}`);
  }
};
