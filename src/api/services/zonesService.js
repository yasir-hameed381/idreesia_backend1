const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
// const PDFDocument = require("pdfkit");
const zonesModel = require("../models/zone")(db);
const mehfilDirectoryModel = require("../models/mehfil-directories")(db);
const ehadKarkunModel = require("../models/ehadKarkun")(db);
const { paginate, constructPagination } = require("./utilityServices");
const { SearchFields } = require("../Enums/searchEnums");

exports.getZones = async ({
  page = 1,
  size = 50,
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchFields = [
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.COUNTRY_EN,
      SearchFields.COUNTRY_UR,
      SearchFields.CITY_EN,
      SearchFields.CITY_UR,
      SearchFields.CO,
      SearchFields.PRIMARY_PHONE_NUMBER,
      SearchFields.DESCRIPTION,
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
    const { count, rows: data } = await zonesModel.findAndCountAll({
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
    logger.error("Error fetching zone:" + error.message);
    throw error;
  }
};

exports.createZone = async ({
  titleEn,
  titleUr,
  description,
  countryEn,
  countryUr,
  cityEn,
  cityUr,
  co,
  primaryPhoneNumber,
  secondaryPhoneNumber,
}) => {
  try {
    const createZonePayload = {
      title_en: titleEn,
      title_ur: titleUr,
      description,
      country_en: countryEn,
      country_ur: countryUr,
      city_en: cityEn,
      city_ur: cityUr,
      co,
      primary_phone_number: primaryPhoneNumber,
      secondary_phone_number: secondaryPhoneNumber,
      created_at: new Date(),
    };

    return await zonesModel.create(createZonePayload);
  } catch (error) {
    logger.error(`Error creating zone: ${error.message}`);
    throw new Error(`Failed to create zone: ${error.message}`);
  }
};

exports.updateZone = async ({
  id,
  titleEn,
  titleUr,
  description,
  countryEn,
  countryUr,
  cityEn,
  cityUr,
  co,
  primaryPhoneNumber,
  secondaryPhoneNumber,
}) => {
  try {
    const zoneCheck = await zonesModel.findByPk(id);
    if (!zoneCheck) {
      return {
        success: false,
        message: "zone not found",
      };
    }

    const updateZonePayload = {
      title_en: titleEn,
      title_ur: titleUr,
      description,
      country_en: countryEn,
      country_ur: countryUr,
      city_en: cityEn,
      city_ur: cityUr,
      co,
      primary_phone_number: primaryPhoneNumber,
      secondary_phone_number: secondaryPhoneNumber,
      updated_at: new Date(),
    };

    await zonesModel.update(updateZonePayload, { where: { id: id } });
    return {
      success: true,
      message: "zone updated successfully",
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error("Error update zone:" + error.message);
    throw error;
  }
};

exports.deleteZone = async (id) => {
  try {
    // Check if the zone exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: "Invalid zone ID provided",
      };
    }

    const zone = await zonesModel.findByPk(id);
    if (!zone) {
      return {
        success: false,
        message: "zone not found.",
      };
    }

    // Delete the zone
    await zone.destroy();

    return {
      success: true,
      message: "zone deleted successfully.",
    };
  } catch (error) {
    logger.error("Error deleting zone:", error);
    throw error;
  }
};

exports.getZoneById = async (id) => {
  try {
    // Check if the zone exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: "Invalid zone ID provided",
      };
    }

    const zone = await zonesModel.findByPk(id);
    if (!zone) {
      return {
        success: false,
        message: "zone not found.",
      };
    }

    return {
      success: true,
      data: zone,
    };
  } catch (error) {
    logger.error("Error getting zone:", error);
    throw error;
  }
};

// Get zone data for PDF export
exports.getZoneForPdf = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error("Invalid zone ID provided");
    }

    const zone = await zonesModel.findByPk(id);
    if (!zone) {
      throw new Error("Zone not found");
    }

    // Get published mehfil directories
    const mehfilDirectories = await mehfilDirectoryModel.findAll({
      where: {
        zone_id: id,
        is_published: 1,
      },
      order: [["mehfil_number", "ASC"]],
    });

    // Get ehad karkuns
    const ehadKarkuns = await ehadKarkunModel.findAll({
      where: { zone_id: id },
    });

    return {
      success: true,
      data: {
        zone,
        mehfil_directories: mehfilDirectories,
        ehad_karkuns: ehadKarkuns,
      },
    };
  } catch (error) {
    logger.error("Error fetching zone for PDF:", error);
    throw error;
  }
};
