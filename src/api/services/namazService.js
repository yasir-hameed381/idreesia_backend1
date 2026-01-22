const logger = require('../../config/logger');
const { Op } = require('sequelize');
const {sequelize: db} = require('../../config/database')
const namazModel = require("../models/namaz")(db);
const {paginate,constructPagination} = require('./utilityServices')
const { SearchFields } = require('../Enums/searchEnums');


exports.getNamazTimings = async ({ page = 1, size = 50, search = '',requestUrl=''}) => {
  try {
    const searchFields = [
      SearchFields.NAME,
      SearchFields.TIME,
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
    const { count, rows: data } = await namazModel.findAndCountAll({
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
    logger.error('Error fetching namaz timings:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};


exports.createNamazTiming = async ({ fajr, 
      dhuhr, 
      jumma, 
      asr, 
      maghrib, 
      isha, 
      description_en, 
      description_ur, }) => {
  try {
    const createNamazPayload = {
      fajr, 
      dhuhr, 
      jumma, 
      asr, 
      maghrib, 
      isha, 
      description_en, 
      description_ur,
      created_at: new Date(),
    };

    return await namazModel.create(createNamazPayload);
  } catch (error) {
    logger.error(`Error creating namaz time: ${error.message}`);
    throw new Error(`Failed to create namaz time: ${error.message}`);
  }
};


exports.updateNamazTiming = async ({id ,fajr, 
      dhuhr, 
      jumma, 
      asr, 
      maghrib, 
      isha, 
      description_en, 
      description_ur}) => {
  try {
    const namazCheck = await namazModel.findByPk(id);
      if (!namazCheck) {
        return {
          success: false,
          message: 'namaz time not found',
        }
      }

    const updateNamazPayload = {
      fajr, 
      dhuhr, 
      jumma, 
      asr, 
      maghrib, 
      isha, 
      description_en, 
      description_ur,
      updated_at : new Date()
    }

    await namazCheck.update(updateNamazPayload, { where: { id: id } });
    return {
      success: true,
      message: 'namaz time updated successfully',
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error('Error update namaz time:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.deleteNamazTiming = async (id) => {
  try {
    // Check if the tag exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: 'Invalid namaz time ID provided',
      };
    }

    
    const namaz = await namazModel.findByPk(id);
    if (!namaz) {
      return {
      success: true,
      message: 'namaz time not found.',
    };
    }

    // Delete the tag
    await namaz.destroy();

    return {
      success: true,
      message: 'namaz time deleted successfully.'
    };
  } catch (error) {
    logger.error('Error deleting namaz time:', error);
    return next(error);
  }
};

