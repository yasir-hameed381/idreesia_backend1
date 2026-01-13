const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const newKarkunModel = require("../models/newEhadKarkun")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

// Create New Karkun
exports.createKarkun = async ({
  name,
  father_name,
  marfat,
  phone_no,
  address,
  mehfil_directory_id,
  zone_id,
}) => {
  try {
    const createPayload = {
      name,
      father_name,
      marfat,
      phone_no,
      address,
      mehfil_directory_id,
      zone_id,
      created_at: new Date(),
    };

    console.log("Create Payload:", createPayload); // Debugging line

    return await newKarkunModel.create(createPayload);
  } catch (error) {
    logger.error(`Error creating Karkun: ${error.message}`);
    throw new Error(`Failed to create Karkun: ${error.message}`);
  }
};

// Get All Karkuns (with pagination + search)
exports.getKarkuns = async ({
  page = 1,
  size = 50,
  search = "",
  zone_id,
  mehfil_directory_id,
  requestUrl = "",
}) => {
  try {
    const { offset, limit, currentPage } = await paginate({ page, size });

    // Build conditions array for proper AND/OR combination
    const conditions = [];

    // Add search conditions
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchConditions = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { father_name: { [Op.like]: `%${searchTerm}%` } },
        { marfat: { [Op.like]: `%${searchTerm}%` } },
        { phone_number: { [Op.like]: `%${searchTerm}%` } },
      ];

      // Also try exact numeric match for ID if search term is a number
      const searchNum = parseInt(searchTerm);
      if (!isNaN(searchNum)) {
        searchConditions.push({ id: searchNum });
      }

      if (searchConditions.length > 0) {
        conditions.push({ [Op.or]: searchConditions });
      }
    }

    // Add zone filter
    if (zone_id && zone_id.trim()) {
      const zoneIdNum = parseInt(zone_id);
      if (!isNaN(zoneIdNum)) {
        conditions.push({ zone_id: zoneIdNum });
      }
    }

    // Add mehfil directory filter
    if (mehfil_directory_id && mehfil_directory_id.trim()) {
      const mehfilIdNum = parseInt(mehfil_directory_id);
      if (!isNaN(mehfilIdNum)) {
        conditions.push({ mehfil_directory_id: mehfilIdNum });
      }
    }

    // Build final where clause
    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

    const { count, rows: data } = await newKarkunModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [["id", "DESC"]],
    });

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    return { data, links, meta };
  } catch (error) {
    logger.error("Error fetching Karkuns:" + error.message);
    throw new Error(`Failed to fetch Karkuns: ${error.message}`);
  }
};

// Get Karkun by ID
exports.getKarkunById = async (id) => {
  try {
    if (!id) {
      return { success: false, message: "Karkun not found" };
    }
    const karkun = await newKarkunModel.findByPk(id);
    if (!karkun) {
      return { success: false, message: "Karkun not found" };
    }
    return { success: true, data: karkun };
  } catch (error) {
    logger.error("Error fetching Karkun by ID:" + error.message);
    throw new Error(`Failed to fetch Karkun: ${error.message}`);
  }
};

// Update Karkun
exports.updateKarkun = async ({
  id,
  name,
  father_name,
  marfat,
  phone_no,
  address,
  mehfil_directory_id,
  zone_id,
}) => {
  try {
    const karkunCheck = await newKarkunModel.findByPk(id);
    if (!karkunCheck) {
      return { success: false, message: "Karkun not found" };
    }

    const updatePayload = {
      name,
      father_name,
      marfat,
      phone_no,
      address,
      mehfil_directory_id,
      zone_id,
      updated_at: new Date(),
    };

    await newKarkunModel.update(updatePayload, { where: { id } });

    return { success: true, message: "Karkun updated successfully" };
  } catch (error) {
    logger.error("Error updating Karkun:" + error.message);
    throw new Error(`Failed to update Karkun: ${error.message}`);
  }
};

// Delete Karkun
exports.deleteKarkun = async (id) => {
  try {
    const karkun = await newKarkunModel.findByPk(id);
    if (!karkun) {
      return { success: false, message: "Karkun not found" };
    }

    await karkun.destroy();
    return { success: true, message: "Karkun deleted successfully" };
  } catch (error) {
    logger.error(`Error deleting Karkun: ${error.message}`);
    throw new Error(`Failed to delete Karkun: ${error.message}`);
  }
};
