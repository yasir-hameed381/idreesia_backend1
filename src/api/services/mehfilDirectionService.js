const logger = require('../../config/logger');
const { Op } = require('sequelize');
const {sequelize: db} = require('../../config/database')
const mehfilDirectoryModel = require("../models/mehfil-directories")(db);
const {paginate,constructPagination} = require('./utilityServices')
const { SearchFields } = require('../Enums/searchEnums');


exports.getMehfilDirections = async ({ page = 1, size = 25, zoneId = '' , search = '',requestUrl=''}) => {
  try {

    const searchFields = [
      SearchFields.ID,
      SearchFields.MEHFIL_NUMBER,
      SearchFields.COUNTRY_EN,
      SearchFields.COUNTRY_UR,
      SearchFields.CITY_EN,
      SearchFields.CITY_UR,
      SearchFields.NAME_EN,
      SearchFields.NAME_UR,
      SearchFields.ADDRESS_EN,
      SearchFields.ADDRESS_UR,
      SearchFields.MEDIACELL_CO,
      SearchFields.CO_PHONE_NUMBER,
      SearchFields.ZIMDAR_BHAI,
      SearchFields.ZIMDAR_BHAI_PHONE_NUMBER,
      SearchFields.ZIMDAR_BHAI_PHONE_NUMBER_2,
      SearchFields.ZIMDAR_BHAI_PHONE_NUMBER_3,
      SearchFields.SARKARI_RENT,
      SearchFields.IPAD_SERIAL_NUMBER,
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

    if (zoneId) {
      where.zone_id = zoneId;
    }
    console.log('where',where)
    // Query the database using Sequelize's findAndCountAll method
    // - 'where' specifies the filtering conditions
    // - 'offset' skips a certain number of records for pagination
    // - 'limit' limits the number of records retrieved
    const { count, rows: data } = await mehfilDirectoryModel.findAndCountAll({
      where,
      offset,
      limit,
    });
console.log('data',data);
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
    logger.error('Error fetching mehfil-Direction:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};


exports.createMehfilDirection = async ({ zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description }) => {
  try {
    const createmehfilDirectionPayload = {
      zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description,
      created_at: new Date(),
    };

    return await mehfilDirectoryModel.create(createmehfilDirectionPayload);
  } catch (error) {
    logger.error(`Error creating mehfil-Direction: ${error.message}`);
    throw new Error(`Failed to create mehfil-Direction: ${error.message}`);
  }
};


exports.updateMehfilDirection = async ({id ,zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description}) => {
  try {
    const mehfilDirectionCheck = await mehfilDirectoryModel.findByPk(id);
      if (!mehfilDirectionCheck) {
        return {
          success: false,
          message: 'mehfil-Direction not found',
        }
      }

    const updateTagPayload = {
      zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description,
      updated_at : new Date()
    }

    await mehfilDirectoryModel.update(updateTagPayload, { where: { id: id } });
    return {
      success: true,
      message: 'mehfil-Direction updated successfully',
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error('Error update mehfil-Direction:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.deleteMehfilDirection = async (id) => {
  try {
    // Check if the tag exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: 'Invalid mehfil-Direction ID provided',
      };
    }

    const mehfilDirection = await mehfilDirectoryModel.findByPk(id);
    if (!mehfilDirection) {
      return {
      success: true,
      message: 'mehfil-Direction not found.',
    };
    }

    // Delete the tag
    await mehfilDirection.destroy();

    return {
      success: true,
      message: 'mehfil-Direction deleted successfully.'
    };
  } catch (error) {
    logger.error('Error deleting mehfil-Direction:', error);
    return next(error);
  }
};
exports.getDirectionById = async (id) => {
  try {
    // Check if the tag exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: 'Invalid mehfil-Direction ID provided',
      };
    }

    const mehfilDirection = await mehfilDirectoryModel.findByPk(id);
    if (!mehfilDirection) {
      return {
      success: true,
      message: 'mehfil-Direction not found.',
    };
    }

    return {
      success: true,
      data: mehfilDirection
    };
  } catch (error) {
    logger.error('Error deleting mehfil-Direction:', error);
    return next(error);
  }
};

