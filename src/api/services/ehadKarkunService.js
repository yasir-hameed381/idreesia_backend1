const logger = require('../../config/logger');
const { Op } = require('sequelize');
const { sequelize: db } = require('../../config/database')
const ehadKarkunModel = require("../models/ehadKarkun")(db);
const { paginate, constructPagination } = require('./utilityServices')
const { SearchFields } = require('../Enums/searchEnums');


exports.getEhadKarkun = async ({ page = 1, size = 50, search = '', zone_id = null, sortField = 'created_at', sortDirection = 'DESC', requestUrl = '' }) => {
  try {
    const searchFields = [
      SearchFields.NAME_EN,
      SearchFields.NAME_UR,
      SearchFields.COUNTRY_EN,
      SearchFields.COUNTRY_UR,
      SearchFields.CITY_EN,
      SearchFields.CITY_UR,
      SearchFields.SO_EN,
      SearchFields.SO_UR,
      SearchFields.MOBILE_NO,
      SearchFields.DESCRIPTION,
      SearchFields.CNIC,
      SearchFields.BIRTH_YEAR,
      SearchFields.EHAD_YEAR,
      SearchFields.EHAD_IJAZAT_YEAR,

    ];
    // Use the pagination service to calculate offset, limit, and currentPage based on the given page and size
    const { offset, limit, currentPage } = await paginate({ page, size });

    // Initialize the 'where' object for query conditions
    const where = {};

    // Add zone filter if provided
    if (zone_id) {
      where.zone_id = zone_id;
    }

    // Add search condition if 'search' is provided and there are fields to search in
    if (search && searchFields.length > 0) {
      // Dynamically generate a WHERE clause for the search fields using Sequelize's Op.like operator
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` }, // Perform a LIKE search with the search keyword
      }));
    }

    // Map frontend sort field names to database column names
    const sortFieldMap = {
      'id': 'id',
      'name': 'name_en',
      'phone_number': 'mobile_no',
      'zone_id': 'zone_id',
      'city': 'city_en',
      'country': 'country_en',
      'created_at': 'created_at',
    };

    const dbSortField = sortFieldMap[sortField] || 'created_at';
    const order = [[dbSortField, sortDirection.toUpperCase()]];

    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved
    // - 'order' specifies the sorting
    const { count, rows: data } = await ehadKarkunModel.findAndCountAll({
      where,
      offset,
      limit,
      order,
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
    logger.error('Error fetching zone:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};


exports.createEhadKarkun = async ({ zone_id,
  name_en,
  name_ur,
  so_en,
  so_ur,
  mobile_no,
  cnic,
  city_en,
  city_ur,
  country_en,
  country_ur,
  birth_year,
  ehad_year,
  ehad_ijazat_year,
  description }) => {
  try {
    const createZonePayload = {
      zone_id,
      name_en,
      name_ur,
      so_en,
      so_ur,
      mobile_no,
      cnic,
      city_en,
      city_ur,
      country_en,
      country_ur,
      birth_year,
      ehad_year,
      ehad_ijazat_year,
      description,
      created_at: new Date(),
    };

    return await ehadKarkunModel.create(createZonePayload);
  } catch (error) {
    logger.error(`Error creating zone: ${error.message}`);
    throw new Error(`Failed to create zone: ${error.message}`);
  }
};


exports.updateEhadKarkun = async ({ id, zone_id,
  name_en,
  name_ur,
  so_en,
  so_ur,
  mobile_no,
  cnic,
  city_en,
  city_ur,
  country_en,
  country_ur,
  birth_year,
  ehad_year,
  ehad_ijazat_year,
  description }) => {
  try {
    const zoneCheck = await ehadKarkunModel.findByPk(id);
    if (!zoneCheck) {
      return {
        success: false,
        message: 'zone not found',
      }
    }

    const updateTagPayload = {
      zone_id,
      name_en,
      name_ur,
      so_en,
      so_ur,
      mobile_no,
      cnic,
      city_en,
      city_ur,
      country_en,
      country_ur,
      birth_year,
      ehad_year,
      ehad_ijazat_year,
      description,
      updated_at: new Date()
    }

    await ehadKarkunModel.update(updateTagPayload, { where: { id: id } });
    return {
      success: true,
      message: 'zone updated successfully',
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error('Error update zone:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.deleteEhadKarkun = async (id) => {
  try {
    // Check if the tag exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: 'Invalid zone ID provided',
      };
    }

    const zone = await ehadKarkunModel.findByPk(id);
    if (!zone) {
      return {
        success: true,
        message: 'zone not found.',
      };
    }

    // Delete the tag
    await zone.destroy();

    return {
      success: true,
      message: 'zone deleted successfully.'
    };
  } catch (error) {
    logger.error('Error deleting zone:', error);
    return next(error);
  }
};

