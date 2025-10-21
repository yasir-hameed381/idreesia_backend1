const logger = require('../../config/logger');
const categoriesService = require('../services/categoriesService');

exports.getCategories = async (req, res, next) => {
 
  try {
    const requestUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { page, size, search } = req.query;
    const result = await categoriesService.getCategories({ page, size, search ,requestUrl });
    return res.json(result);
  } catch (error) {
    logger.error('Error fetching Categories:', error);
    return next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { slug, title_en, title_ur, status } = req.body;

    if (!slug || !title_en || !title_ur) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: slug, title_en, and title_ur are required.',
      });
    }

    const result = await categoriesService.createCategory({ slug, title_en, title_ur, status }); // Pass status
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result,
    });

  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    return next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slug, title_en, title_ur, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required.',
      });
    }

    if (!slug || !title_en || !title_ur) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: slug, title_en, and title_ur are required.',
      });
    }

    const result = await categoriesService.updateCategory({ id, slug, title_en, title_ur, status }); // Pass status

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or update failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
    });

  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    return next(error);
  }
};


exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoriesService.deleteCategory(id);
    return res.json(result);
  } catch (error) {
    logger.error('Error deleting Category:', error);
    return next(error);
  }
};

