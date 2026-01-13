const { Op, where } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const adminUsersModel = require("../models/user-admin")(db);
const modelHasRolesModel = require("../models/modelHasRoles")(db);
const rolesModel = require("../models/roles")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

// Set up associations
adminUsersModel.belongsToMany(rolesModel, {
  through: {
    model: modelHasRolesModel,
    unique: false,
  },
  foreignKey: "model_id",
  otherKey: "role_id",
  as: "roles",
  constraints: false,
});

exports.getuserAdmins = async ({
  page = 1,
  size = 50,
  search = "",
  sortField = "id",
  sortDirection = "ASC",
  requestUrl = "",
}) => {
  try {
    const searchFields = [
      SearchFields.NAME,
      SearchFields.ZONE_ID,
      SearchFields.FATHERNAME,
      SearchFields.BIRTH_YEAR,
      SearchFields.EHAD_YEAR,
      SearchFields.DUTY_TYPE,
    ];
    // Use the pagination service to calculate offset, limit, and currentPage based on the given page and size
    const { offset, limit, currentPage } = await paginate({ page, size });

    // Initialize the 'where' object for query conditions
    const where = {};

    // Add search condition if 'search' is provided and there are fields to search in
    if (search && searchFields.length > 0) {
      console.log("searching", search);
      // Dynamically generate a WHERE clause for the search fields using Sequelize's Op.like operator
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Perform a LIKE search with the search keyword
      }));
    }

    // Validate and normalize sort field
    const sortableFields = ["id", "name", "email", "created_at", "updated_at"];
    const normalizedSortField = sortableFields.includes(sortField) ? sortField : "id";
    const normalizedSortDirection = 
      typeof sortDirection === "string" && sortDirection.toUpperCase() === "DESC" 
        ? "DESC" 
        : "ASC";

    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved
    const { count, rows: data } = await adminUsersModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [[normalizedSortField, normalizedSortDirection]],
      include: [
        {
          model: rolesModel,
          as: "roles",
          attributes: ["id", "name", "guard_name"],
          through: { attributes: [] }, // Hide junction table fields
          required: false,
        },
      ],
    });

    console.log("rowsss", data);

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
    logger.error("Error fetching admin users:" + error.message);
  }
};

exports.getAdminUserById = async (id) => {
  try {
    if (!id) {
      return {
        success: false,
        message: "user not found",
      };
    }
    const adminUser = await adminUsersModel.findByPk(id, {
      include: [
        {
          model: rolesModel,
          as: "roles",
          attributes: ["id", "name", "guard_name"],
          through: { attributes: [] }, // Hide junction table fields
          required: false,
        },
      ],
    });
    if (!adminUser) {
      return {
        success: false,
        message: "user not founded ",
      };
    }
    return {
      success: true,
      data: adminUser,
    };
  } catch (error) {
    console.error(error.message);
    logger.error("Error fetching admin users:", error);
  }
};

exports.createAdminUser = async ({
  zone_id,
  name,
  email,
  password,
  city,
  country,
  is_zone_admin,
  is_mehfil_admin,
  is_super_admin,
  is_region_admin,
  is_all_region_admin,
  user_type,
  father_name,
  phone_number,
  id_card_number,
  address,
  birth_year,
  ehad_year,
  mehfil_directory_id,
  duty_days,
  duty_type,
  is_active,
  affidavit_form_file,
  has_affidavit_form,
  region_id,
  role_id,
  role_ids
}) => {
  const transaction = await db.transaction();
  try {
    // Support both role_id (single) and role_ids (array) for backward compatibility
    const rolesToAssign = role_ids && Array.isArray(role_ids) && role_ids.length > 0 
      ? role_ids 
      : role_id 
        ? [role_id] 
        : [];

    console.log("🔍 Creating admin user with payload:", {
      zone_id,
      name,
      email,
      password: password ? "[HIDDEN]" : "undefined",
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      is_all_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form,
      region_id,
      role_id,
      role_ids,
      rolesToAssign
    });

    if (!password) {
      throw new Error("Password is required");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const adminUserPayload = {
      zone_id,
      region_id,
      name,
      email,
      password: hashedPassword,
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      is_all_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form,
      created_at: new Date(),
    };

    console.log("📤 Final payload for database:", adminUserPayload);

    const result = await adminUsersModel.create(adminUserPayload, { transaction });
    console.log("✅ Admin user created successfully:", result.id);

    // Assign multiple roles to user in model_has_roles table (like Laravel syncRoles)
    if (rolesToAssign.length > 0) {
      const roleAssignments = rolesToAssign.map(roleId => ({
        role_id: roleId,
        model_type: "users",
        model_id: result.id,
      }));
      
      await modelHasRolesModel.bulkCreate(roleAssignments, { transaction });
      console.log(`✅ Roles [${rolesToAssign.join(', ')}] assigned to user ${result.id} in model_has_roles`);
    }

    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error creating admin user:", error.message);
    console.error("❌ Error details:", error);

    // Check for specific validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${validationErrors}`);
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      const uniqueErrors = error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      throw new Error(`Duplicate entry: ${uniqueErrors}`);
    }

    logger.error(`Error creating admin user: ${error.message}`);
    throw new Error(`Failed to create admin: ${error.message}`);
  }
};

exports.updateAdminUser = async ({
  id,
  zone_id,
  name,
  email,
  password,
  city,
  country,
  is_zone_admin,
  is_mehfil_admin,
  is_super_admin,
  is_region_admin,
  is_all_region_admin,
  user_type,
  father_name,
  phone_number,
  id_card_number,
  address,
  birth_year,
  ehad_year,
  mehfil_directory_id,
  duty_days,
  duty_type,
  is_active,
  affidavit_form_file,
  has_affidavit_form,
  region_id,
  role_id,
  role_ids
}) => {
  const transaction = await db.transaction();
  try {
    // Support both role_id (single) and role_ids (array) for backward compatibility
    const rolesToAssign = role_ids !== undefined && Array.isArray(role_ids)
      ? role_ids 
      : role_id !== undefined 
        ? (role_id ? [role_id] : [])
        : undefined;

    console.log("🔍 Updating admin user with ID:", id);
    console.log("📝 Update payload:", {
      zone_id,
      name,
      email,
      password: password ? "[HIDDEN]" : "undefined",
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      is_all_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form,
      region_id,
      role_id,
      role_ids,
      rolesToAssign
    });

    const adminUser = await adminUsersModel.findByPk(id);
    if (!adminUser) {
      await transaction.rollback();
      return {
        success: false,
        message: "admin user not found",
      };
    }

    const adminUserPayload = {
      zone_id,
      region_id,
      name,
      email,
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      is_all_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form
    };

    // Only hash and update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      adminUserPayload.password = hashedPassword;
    }

    console.log("📤 Final update payload:", adminUserPayload);

    await adminUsersModel.update(adminUserPayload, {
      where: { id: id },
      transaction,
    });

    // Update role assignment in model_has_roles table (sync roles like Laravel)
    if (rolesToAssign !== undefined) {
      // Delete existing role assignments for this user
      await modelHasRolesModel.destroy({
        where: {
          model_id: id,
          model_type: "users",
        },
        transaction,
      });

      // Assign new roles if provided
      if (rolesToAssign.length > 0) {
        const roleAssignments = rolesToAssign.map(roleId => ({
          role_id: roleId,
          model_type: "users",
          model_id: id,
        }));
        
        await modelHasRolesModel.bulkCreate(roleAssignments, { transaction });
        console.log(`✅ Roles [${rolesToAssign.join(', ')}] assigned to user ${id} in model_has_roles`);
      } else {
        console.log(`✅ All roles removed from user ${id}`);
      }
    }

    await transaction.commit();
    console.log("✅ Admin user updated successfully");
    return {
      success: true,
      message: "admin user updated successfully.",
    };
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error updating admin user:", error.message);
    console.error("❌ Error details:", error);

    // Check for specific validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${validationErrors}`);
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      const uniqueErrors = error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      throw new Error(`Duplicate entry: ${uniqueErrors}`);
    }

    logger.error(`Error updating admin user: ${error.message}`);
    throw new Error(`Failed to update admin: ${error.message}`);
  }
};

exports.deleteAdminUser = async (id) => {
  const transaction = await db.transaction();
  try {
    const adminUser = await adminUsersModel.findByPk(id);

    if (!adminUser) {
      await transaction.rollback();
      return {
        success: false,
        message: "admin user not found",
      };
    }

    // Delete role assignments from model_has_roles
    await modelHasRolesModel.destroy({
      where: {
        model_id: id,
        model_type: "users",
      },
      transaction,
    });

    // Delete the user
    await adminUser.destroy({ transaction });

    await transaction.commit();
    return {
      success: true,
      message: "admin user deleted successfully.",
    };
  } catch (error) {
    await transaction.rollback();
    logger.error("error deleting admin user", error.message);
    throw new Error("failed to delete admin user", error.message);
  }
};
