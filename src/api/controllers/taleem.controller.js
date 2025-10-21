const logger = require('../../config/logger');
const taleemService = require('../services/taleemService');
const { SearchFields } = require('../Enums/searchEnums');


exports.getTaleem = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

    const { page, size, category, search } = req.query;
    
    const result = await taleemService.getTaleem({ page, size, category, search ,requestUrl });
    return res.json(result);
  } catch (error) {
    logger.error('Error fetching taleem:', error);
    return next(error);
  }
};

exports.createTaleemShareef = async (req, res, next) => {
  try {
    const { slug, title_en, title_ur ,description ,track,category_id ,filename ,is_published,filepath ,created_by} = req.body;
  
       const requiredFields = ["slug", "title_en", "title_ur", "description", "track", 
        "category_id", "filepath","filename","created_by"];
  
       const missingFields = requiredFields.filter(field => !req.body[field]);
       
       if (missingFields.length > 0) {
  
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`
        });
      }
  
      const result = await taleemService.createTaleemShareef({ slug, title_en, title_ur ,description ,track,category_id ,is_published,filename ,filepath ,created_by});
      return res.status(201).json({
        success: true,
        message: 'Taleemat created successfully',
        data: result,
      });
  
    } catch (error) {
      logger.error(`Error creating Taleemat: ${error.message}`);
      return next(error);
    }
};

exports.updateTaleemShareef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slug, title_en, title_ur ,description ,track,category_id ,is_published,filename ,filepath ,updated_by} = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Taleem Shareef ID is required.',
      });
    }

    const requiredFields = ["slug", "title_en", "title_ur", "description", "track", 
      "category_id", "filepath","filename","updated_by"];

     const missingFields = requiredFields.filter(field => !req.body[field]);
     
     if (missingFields.length > 0) {

      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    const result = await taleemService.updateTaleemShareef({ id, slug, title_en, title_ur ,description ,track,category_id ,is_published,filename ,filepath ,updated_by});

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Taleem Shareef not found or update failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Taleem Shareef updated successfully.',
    });

  } catch (error) {
    logger.error(`Error updating Taleem Shareef: ${error.message}`);
    return next(error);
  }
};


exports.removeTaleemShareef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await taleemService.removeTaleemShareef(id);
    return res.json(result);
  } catch (error) {
    logger.error('Error deleting Taleem Shareef:', error);
    return next(error);
  }
};

