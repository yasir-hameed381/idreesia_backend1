const { Op, where } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const adminUsersModel = require("../models/user-admin")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

exports.getuserAdmins = async ({
  page = 1,
  size = 50,
  search = "",
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

    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved
    const { count, rows: data } = await adminUsersModel.findAndCountAll({
      where,
      offset,
      limit,
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
    const adminUser = await adminUsersModel.findByPk(id);
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
  region_id
}) => {
  try {
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
      region_id
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

    const result = await adminUsersModel.create(adminUserPayload);
    console.log("✅ Admin user created successfully:", result.id);
    return result;
  } catch (error) {
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
  region_id
}) => {
  try {
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
      region_id
    });

    const adminUser = await adminUsersModel.findByPk(id);
    if (!adminUser) {
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
    });

    console.log("✅ Admin user updated successfully");
    return {
      success: true,
      message: "admin user updated successfully.",
    };
  } catch (error) {
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
  try {
    const adminUser = await adminUsersModel.findByPk(id);

    if (!adminUser) {
      return {
        success: false,
        message: "admin user not found",
      };
    }

    await adminUser.destroy();

    return {
      success: true,
      message: "admin user deleted successfully.",
    };
  } catch (error) {
    logger.error("error deleting admin user", error.message);
    throw new Error("failed to delete admin user", error.message);
  }
};
