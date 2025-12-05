const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const userModel = require("../models/user-admin")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

exports.createKarkun = async ({
  zone_id,
  name,
  email,
  password,
  city,
  country,
  is_zone_admin,
  is_mehfil_admin,
  user_type = 'karkun',
  father_name,
  phone_number,
  id_card_number,
  address,
  birth_year,
  ehad_year,
  duty_days,
  duty_type,
}) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const createKarkunPayload = {
      zone_id,
      name,
      email,
      password: hashedPassword,
      city,
      country,
      is_zone_admin: is_zone_admin || false,
      is_mehfil_admin: is_mehfil_admin || false,
      user_type: user_type || 'karkun',
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      duty_days,
      duty_type,
      created_at: new Date(),
    };

    return await userModel.create(createKarkunPayload);
  } catch (error) {
    logger.error(`Error creating karkun: ${error.message}`);
    throw new Error(`Failed to create karkun: ${error.message}`);
  }
};

exports.getKarkun = async ({
  page = 1,
  size = 50,
  search = "",
  zone_id = null,
  requestUrl = "",
}) => {
  try {
    // Validate that model is initialized
    if (!userModel) {
      throw new Error("User model is not initialized");
    }

    // Use the pagination service to calculate offset, limit, and currentPage based on the given page and size
    const { offset, limit, currentPage } = paginate({ page, size });

    // Initialize the 'where' object for query conditions
    // Filter by user_type = 'karkun' or 'Karkun'
    const whereConditions = [
      {
        [Op.or]: [
          { user_type: 'karkun' },
          { user_type: 'Karkun' }
        ]
      }
    ];

    // Add zone_id filter if provided
    if (zone_id !== null && zone_id !== undefined) {
      whereConditions.push({
        zone_id: zone_id
      });
    }

    // Add search condition if 'search' is provided
    if (search && search.trim()) {
      // Map search fields to users table column names
      const searchConditions = [
        { name: { [Op.like]: `%${search}%` } },
        { name_ur: { [Op.like]: `%${search}%` } },
        { father_name: { [Op.like]: `%${search}%` } },
        { father_name_ur: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
        { id_card_number: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];

      // Add numeric fields if search is numeric
      if (!isNaN(search)) {
        searchConditions.push(
          { birth_year: parseInt(search) },
          { ehad_year: parseInt(search) }
        );
      }

      // Add search conditions to where clause
      whereConditions.push({
        [Op.or]: searchConditions
      });
    }

    // Build final where clause
    const where = whereConditions.length === 1 
      ? whereConditions[0] 
      : { [Op.and]: whereConditions };

    // Query the database using Sequelize's findAndCountAll method
    const queryOptions = {
      where: where,
      offset: Math.max(0, offset), // Ensure offset is not negative
      limit: Math.max(1, Math.min(limit, 100)), // Ensure limit is between 1 and 100
      order: [['id', 'DESC']], // Order by id (more reliable than created_at)
    };

    logger.info(`Querying karkuns with options:`, {
      offset: queryOptions.offset,
      limit: queryOptions.limit,
      hasWhere: !!queryOptions.where,
    });

    const { count, rows: data } = await userModel.findAndCountAll(queryOptions);

    logger.info(`Found ${count} total karkuns, returning ${data.length} records`);

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl || '/api/karkun',
    });

    // Return the data and pagination details
    return {
      data: data || [],
      links,
      meta,
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error fetching karkun:", error.message);
    logger.error("Error name:", error.name);
    logger.error("Error stack:", error.stack);
    
    // If it's a Sequelize error, log more details
    if (error.name === 'SequelizeDatabaseError') {
      logger.error("Database error details:", error.original);
    }
    
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.getKarkunById = async (id) => {
  try {
    if (!id) {
      return { success: false, message: "karkun not found" };
    }
    const karkun = await userModel.findOne({
      where: {
        id: id,
        [Op.or]: [
          { user_type: 'karkun' },
          { user_type: 'Karkun' }
        ]
      }
    });
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
    throw error;
  }
};

exports.updateKarkun = async ({
  id,
  zone_id,
  name,
  email,
  password,
  city,
  country,
  is_zone_admin,
  is_mehfil_admin,
  user_type,
  father_name,
  phone_number,
  id_card_number,
  address,
  birth_year,
  ehad_year,
  duty_days,
  duty_type,
}) => {
  try {
    const karkunCheck = await userModel.findOne({
      where: {
        id: id,
        [Op.or]: [
          { user_type: 'karkun' },
          { user_type: 'Karkun' }
        ]
      }
    });
    if (!karkunCheck) {
      return {
        success: false,
        message: "karkun not found",
      };
    }

    const updatePayload = {};
    
    // Only include fields that are provided
    if (zone_id !== undefined) updatePayload.zone_id = zone_id;
    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email;
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updatePayload.password = hashedPassword;
    }
    if (city !== undefined) updatePayload.city = city;
    if (country !== undefined) updatePayload.country = country;
    if (is_zone_admin !== undefined) updatePayload.is_zone_admin = is_zone_admin;
    if (is_mehfil_admin !== undefined) updatePayload.is_mehfil_admin = is_mehfil_admin;
    if (user_type !== undefined) updatePayload.user_type = user_type;
    if (father_name !== undefined) updatePayload.father_name = father_name;
    if (phone_number !== undefined) updatePayload.phone_number = phone_number;
    if (id_card_number !== undefined) updatePayload.id_card_number = id_card_number;
    if (address !== undefined) updatePayload.address = address;
    if (birth_year !== undefined) updatePayload.birth_year = birth_year;
    if (ehad_year !== undefined) updatePayload.ehad_year = ehad_year;
    if (duty_days !== undefined) updatePayload.duty_days = duty_days;
    if (duty_type !== undefined) updatePayload.duty_type = duty_type;
    
    updatePayload.updated_at = new Date();

    await userModel.update(updatePayload, { where: { id: id } });
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
    const karkun = await userModel.findOne({
      where: {
        id: id,
        [Op.or]: [
          { user_type: 'karkun' },
          { user_type: 'Karkun' }
        ]
      }
    });
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
