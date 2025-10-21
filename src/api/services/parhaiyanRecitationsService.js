const logger = require('../../config/logger');
const { Op } = require('sequelize');
const {sequelize: db} = require('../../config/database')
const parhaiyanRecitationsModel = require("../models/parhaiyan-recitations")(db);
const {paginate,constructPagination} = require('./utilityServices')
const { SearchFields } = require('../Enums/searchEnums');


exports.getParhaiyanRecitations = async ({ page = 1, size = 25, search = '',requestUrl=''}) => {
  try {
    const searchFields = [
      SearchFields.NAME,
      SearchFields.CITY,
      SearchFields.MOBILE_NUMBER,
      SearchFields.FATHER_NAME,
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
    const { count, rows: data } = await parhaiyanRecitationsModel.findAndCountAll({
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


exports.createParhaiyanRecitations = async ({ parhaiyan_id, darood_ibrahimi ,yaseen_shareef , qul_shareef ,quran_pak ,name ,father_name,city,mobile_number ,...prop},) => {
  try {
    const createParhaiyanRecitationsPayload = {
      parhaiyan_id, 
      darood_ibrahimi ,
      yaseen_shareef ,
      qul_shareef,
      quran_pak ,
      name ,
      father_name ,
      city,
      mobile_number,
      created_at: new Date(),
      ...prop
    };
    return await parhaiyanRecitationsModel.create(createParhaiyanRecitationsPayload);
  } catch (error) {
    logger.error(`Error creating tag: ${error.message}`);
    throw new Error(`Failed to create tag: ${error.message}`);
  }
};

