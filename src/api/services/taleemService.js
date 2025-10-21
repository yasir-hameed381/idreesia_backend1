const logger = require('../../config/logger');
const { Op } = require('sequelize');
const {sequelize: db} = require('../../config/database')
const taleemModel = require("../models/taleem")(db);
const {paginate,constructPagination} = require('../services/utilityServices')
const { SearchFields } = require('../Enums/searchEnums');
const { Category } = require('../Enums/catgoryEnums');


exports.getTaleem = async ({ page = 1, size = 25, category = '', search = '',requestUrl='' }) => {
  try {

    const allowedCategories = [
      Category.ALL_TALEEMAT,
      Category.BASIC_TALEEMAT,
      Category.QURAN_RECITATIONS,
      Category.DUA_MUBARAK,
      Category.AZAN,
      Category.NEW_DAILY_TALEEM,
      Category.SHORT_TALEEMAT,
    ]; // Allowed category values

    // Validate the category parameter (empty string is allowed, treated as 'all')
    if (category && !allowedCategories.includes(category.toLowerCase())) {
      return {
        success: false,
        error: `Invalid category. Allowed categories are: ${allowedCategories.join(',')}`,
      };
    }

    const searchFields = [
          SearchFields.TITLE_EN,
          SearchFields.TITLE_UR,
          SearchFields.DESCRIPTION,
          SearchFields.FILENAME,
          SearchFields.TRACK,
        ];

    const { offset, limit, currentPage } = await paginate({ page, size});

    const where = {};
 
    if (search && searchFields.length > 0) {
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }

    if (category && category.toLowerCase() !== 'all') {
      where.category_id = category;
    }

    const { count, rows: data } = await taleemModel.findAndCountAll({
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
    logger.error('Error fetching taleem:'+error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.createTaleemShareef = async ({ slug, title_en, title_ur ,description ,track,category_id ,is_published,filename ,filepath ,created_by}) => {
  try {

    const createTaleemShareefPayload = {
      slug,
      title_en,
      title_ur,
      description,
      track,
      category_id,
      is_published,
      filename,
      filepath,
      created_at: new Date(),
      created_by: created_by
    };

    return await taleemModel.create(createTaleemShareefPayload);
  } catch (error) {
    logger.error(`Error creating Taleem Shareef: ${error.message}`);
    throw new Error(`Failed to create Taleem Shareef: ${error.message}`);
  }
};


exports.updateTaleemShareef = async ({ id,slug, title_en, title_ur ,description ,track,category_id ,is_published,filename ,filepath,updated_by}) => {
  try {
    const taleemShareefCheck = await taleemModel.findByPk(id);
    console.log('taleemShareefCheck',taleemShareefCheck)
      if (!taleemShareefCheck) {
        return {
          success: false,
          message: 'Taleem Shareef Data not found',
        }
      }

    const updateTaleemShareefPayload = {
      slug,
      title_en,
      title_ur,
      description,
      track,
      category_id,
      is_published,
      filename,
      filepath,
      updated_at : new Date(),
      updated_by : updated_by
    }

    await taleemModel.update(updateTaleemShareefPayload, { where: { id } });
    return {
      success: true,
      message: 'Taleem Shareef updated successfully',
    };
  } catch (error) {
    // Log any errors encountered during the process
    logger.error('Error update Taleem Shareef:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};


exports.removeTaleemShareef = async (taleemShareef_id) => {
  try {
    // Check if the mehfil exists
    if (!taleemShareef_id || isNaN(taleemShareef_id)) {
      return {
        success: false,
        message: 'Invalid Taleem Shareef ID provided',
      };
    }

    const taleemShareef = await taleemModel.findByPk(taleemShareef_id);
    if (!taleemShareef) {
      return {
      success: true,
      message: 'Taleem Shareef data not found.',
    };
    }

    // Delete the taleem shareef
    await taleemShareef.destroy();

    return {
      success: true,
      message: 'Taleem Shareef deleted successfully.'
    };
  } catch (error) {
    logger.error('Error deleting Taleem Shareef:', error);
    return next(error);
  }
};
