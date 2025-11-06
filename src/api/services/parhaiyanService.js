const logger = require('../../config/logger');
const { Op } = require('sequelize');
const {sequelize: db} = require('../../config/database')
const parhaiyanModel = require("../models/parhaiyan")(db);
const {paginate,constructPagination} = require('./utilityServices')
const { SearchFields } = require('../Enums/searchEnums');


exports.getParhaiyans = async ({ page = 1, size = 25, search = '',requestUrl=''}) => {
  try {
    const searchFields = [
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.DESCRIPTION_EN,
      SearchFields.DESCRIPTION_UR,
      SearchFields.START_DATE,
      SearchFields.END_DATE,

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
    const { count, rows: data } = await parhaiyanModel.findAndCountAll({
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
    logger.error('Error fetching parhaiyan:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};


exports.createParhaiyan = async ({ title_en, title_ur ,description_ur ,description_en ,start_date ,end_date ,url_slug , is_active }) => {
  try {

    const createTagPayload = {
      title_en, 
      title_ur ,
      description_ur ,
      description_en ,
      start_date ,
      end_date ,
      url_slug,
      is_active,
      created_at: new Date(),
    };

    return await parhaiyanModel.create(createTagPayload);
  } catch (error) {
    logger.error(`Error creating tag: ${error.message}`);
    throw new Error(`Failed to create tag: ${error.message}`);
  }
};


exports.updateParhaiyan = async ({id ,title_en, title_ur ,description_ur ,description_en ,start_date ,end_date ,url_slug , is_active}) => {
  try {
    const parhaiyanCheck = await parhaiyanModel.findByPk(id);
      if (!parhaiyanCheck) {
        return {
          success: false,
          message: 'Parhaiyan data not found',
        }
      }

    const updateTagPayload = {
      title_en, 
      title_ur ,
      description_ur ,
      description_en ,
      start_date ,
      end_date ,
      url_slug,
      is_active,
      updated_at : new Date()
    }

    await parhaiyanModel.update(updateTagPayload, { where: { id: id } });
    return {
      success: true,
      message: 'Parhaiyan updated successfully',
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error('Error update Parhaiyan:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.deleteParhaiyan = async (id) => {
  try {
    // Check if the tag exists
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: 'Invalid ID provided',
      };
    }

    const parhaiyan = await parhaiyanModel.findByPk(id);
    if (!parhaiyan) {
      return {
      success: true,
      message: 'Parhaiyan not found.',
    };
    }

    // Delete the tag
    await parhaiyan.destroy();

    return {
      success: true,
      message: 'Parhaiyan deleted successfully.'
    };
  } catch (error) {
    logger.error('Error deleting Parhaiyan:', error);
    throw error;
  }
};

exports.activeParhaiyan = async () => {
  try {
    const activeParhaiyan = await parhaiyanModel.findAll({
      where: {
        is_active: 1,
      },
    });

    return activeParhaiyan;
  } catch (error) {
    logger.error('Error getting active Parhaiyan:', error);
    throw error;
  }
};

