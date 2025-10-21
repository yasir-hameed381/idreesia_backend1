const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const karkunModel = require("../models/karkun")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

exports.createKarkun = async ({
  zone,
  name,
  email,
  password,
  city,
  country,
  is_zone_admin,
  is_mehfile_admin,
  user_type,
  father_name,
  mobile_no,
  cnic_no,
  address,
  birth_year,
  ehad_year,
  mehfile,
  duty_days,
  duty_type,
}) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const createKarkunPayload = {
      zone,
      name,
      email,
      password: hashedPassword,
      city,
      country,
      is_zone_admin,
      is_mehfile_admin,
      user_type,
      father_name,
      mobile_no,
      cnic_no,
      address,
      birth_year,
      ehad_year,
      mehfile,
      duty_days,
      duty_type,
      created_at: new Date(),
    };

    return await karkunModel.create(createKarkunPayload);
  } catch (error) {
    logger.error(`Error creating karkun: ${error.message}`);
    throw new Error(`Failed to create karkun: ${error.message}`);
  }
};

exports.getKarkun = async ({
  page = 1,
  size = 50,
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchFields = [
      SearchFields.NAME,
      SearchFields.ZONE,
      SearchFields.FATHERNAME,
      SearchFields.MOBILE_NO,
      SearchFields.KARKUN_CNIC,
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
      // Dynamically generate a WHERE clause for the search fields using Sequelize's Op.like operator
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Perform a LIKE search with the search keyword
      }));
    }

    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved
    const { count, rows: data } = await karkunModel.findAndCountAll({
      where,
      offset,
      limit,
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
    logger.error("Error fetching karkun:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.getKarkunById = async (id) => {
  try {
    if (!id) {
      return { success: false, message: "karkun not found" };
    }
    const karkun = await karkunModel.findByPk(id);
    if (!karkun) {
      return { success: false, message: "karkun not found" };
    }
    return {
      success: true,
      data: karkun,
    };
  } catch (error) {
    console.error("error getting karkun", error);
    logger.error("Error fetching karkun users:", error);
  }
};

exports.updateKarkun = async ({
  id,
  zone,
  name,
  email,
  password,
  city,
  country,
  is_zone_admin,
  is_mehfile_admin,
  user_type,
  father_name,
  mobile_no,
  cnic_no,
  address,
  birth_year,
  ehad_year,
  mehfile,
  duty_days,
  duty_type,
}) => {
  try {
    const zoneCheck = await karkunModel.findByPk(id);
    if (!zoneCheck) {
      return {
        success: false,
        message: "karkun not found",
      };
    }

    const updateTagPayload = {
      zone,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfile_admin,
      user_type,
      father_name,
      mobile_no,
      cnic_no,
      address,
      birth_year,
      ehad_year,
      mehfile,
      duty_days,
      duty_type,
      updated_at: new Date(),
    };

    await karkunModel.update(updateTagPayload, { where: { id: id } });
    return {
      success: true,
      message: "karkun updated successfully",
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error update karkun:" + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.deleteKarkun = async (id) => {
  try {
    const karkun = await karkunModel.findByPk(id);
    if (!karkun) {
      return {
        success: false,
        message: "Karkun not found",
      };
    }

    await karkun.destroy();
    return {
      success: true,
      message: "Karkun deleted successfully",
    };
  } catch (error) {
    logger.error(`Error deleting karkun: ${error.message}`);
    throw new Error(`Failed to delete karkun: ${error.message}`);
  }
};
