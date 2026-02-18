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

const safeInt = (v) => {
  if (v == null) return null;
  const n = parseInt(String(v).trim(), 10);
  return Number.isNaN(n) ? null : n;
};

// Get All Karkuns (with pagination + search)
exports.getKarkuns = async ({
  page = 1,
  size = 50,
  search = "",
  zone_id,
  mehfil_directory_id,
  date_from,
  date_to,
  requestUrl = "",
}) => {
  try {
    const { offset, limit, currentPage } = await paginate({ page, size });

    const conditions = [];

    // Search
    const searchStr = typeof search === "string" ? search.trim() : "";
    if (searchStr) {
      const searchConditions = [
        { name: { [Op.like]: `%${searchStr}%` } },
        { father_name: { [Op.like]: `%${searchStr}%` } },
        { marfat: { [Op.like]: `%${searchStr}%` } },
        { phone_number: { [Op.like]: `%${searchStr}%` } },
      ];
      const searchNum = safeInt(searchStr);
      if (searchNum != null) searchConditions.push({ id: searchNum });
      conditions.push({ [Op.or]: searchConditions });
    }

    const zoneIdNum = safeInt(zone_id);
    if (zoneIdNum != null) conditions.push({ zone_id: zoneIdNum });

    const mehfilIdNum = safeInt(mehfil_directory_id);
    if (mehfilIdNum != null) conditions.push({ mehfil_directory_id: mehfilIdNum });

    // Date filters on created_at (YYYY-MM-DD)
    const df = typeof date_from === "string" ? date_from.trim() : "";
    const dt = typeof date_to === "string" ? date_to.trim() : "";
    if (df) {
      const fromDate = new Date(df);
      if (!Number.isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
        conditions.push({ created_at: { [Op.gte]: fromDate } });
      }
    }
    if (dt) {
      const toDate = new Date(dt);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        conditions.push({ created_at: { [Op.lte]: toDate } });
      }
    }

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
