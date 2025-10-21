const logger = require('../../config/logger');
const { Op } = require('sequelize');
const {sequelize: db} = require('../../config/database')
const categoriesModel = require("../models/categories")(db);
const {paginate,constructPagination} = require('./utilityServices')
const { SearchFields } = require('../Enums/searchEnums');


exports.getCategories = async ({ page = 1, size = 25, search = '',requestUrl=''}) => {
  try {
    const searchFields = [
      SearchFields.TITLE_EN,
      SearchFields.TITLE_UR,
      SearchFields.SLUG,
      SearchFields.STATUS,
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
    const { count, rows: data } = await categoriesModel.findAndCountAll({
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
    logger.error('Error fetching categories:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};

exports.createCategory = async ({ slug, title_en, title_ur, status = 1 }) => { 
  try {
    const createCategoryPayload = {
      slug,
      title_en,
      title_ur,
      status: status || 1,
      created_at: new Date(),
    };

    return await categoriesModel.create(createCategoryPayload);
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    throw new Error(`Failed to create category: ${error.message}`);
  }
};


exports.updateCategory = async ({ slug, title_en, title_ur, id, status }) => { 
  try {
    const categoryCheck = await categoriesModel.findByPk(id);
    if (!categoryCheck) {
      return {
        success: false,
        message: 'Category not found',
      }
    }

    const updateCategoryPayload = {
      slug: slug,
      title_en: title_en,
      title_ur: title_ur,
      status: status !== undefined ? status : categoryCheck.status,
      updated_at: new Date()
    }

    await categoriesModel.update(updateCategoryPayload, { where: { id } });
    return {
      success: true,
      message: 'Category updated successfully',
    };
  } catch (error) {
    logger.error('Error update categories:' + error.message);
    throw error; // Re-throw the error so the controller can handle it properly
  }
};


exports.deleteCategory = async (category_id) => {
  try {
    // Check if the tag exists
    if (!category_id || isNaN(category_id)) {
      return {
        success: false,
        message: 'Invalid Category ID provided',
      };
    }

    const category = await categoriesModel.findByPk(category_id);
    if (!category) {
      return {
      success: true,
      message: 'category not found.',
    };
    }

    // Delete the category
    await category.destroy();

    return {
      success: true,
      message: 'Category deleted successfully.'
    };
  } catch (error) {
    logger.error('Error deleting category:', error);
    return next(error);
  }
};


