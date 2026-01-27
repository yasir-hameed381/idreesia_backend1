const logger = require('../../config/logger');
const parhaiyanService = require('../services/parhaiyanService');

exports.getParhaiyans = async (req, res, next) => {
  console.log('req',req.query)
  try {
    const requestUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { page, size, search } = req.query;
    const result = await parhaiyanService.getParhaiyans({ page, size, search ,requestUrl });
    console.log('result',result)
    return res.json(result);
  } catch (error) {
    logger.error('Error fetching Categories:', error);
    return next(error);
  }
};


exports.createParhaiyan = async (req, res, next) => {
  try {
    console.log('req',req.body)
    const { title_en, title_ur ,description_ur ,description_en ,start_date ,end_date ,url_slug,is_active
     } = req.body;

    if (!url_slug || !title_en || !title_ur || !description_ur || !description_en ||
      !start_date || !end_date ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: slug, title_en, and title_ur are required.',
      });
    }

    const result = await parhaiyanService.createParhaiyan({ title_en, title_ur ,description_ur ,description_en ,start_date ,end_date ,url_slug,is_active});
    return res.status(201).json({
      success: true,
      message: 'parhaiyan created successfully',
      data: result,
    });

  } catch (error) {
    logger.error(`Error creating parhaiyan: ${error.message}`);
    return next(error);
  }
};

exports.updateParhaiyan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title_en, title_ur ,description_ur ,description_en ,start_date ,end_date ,url_slug,is_active
    } = req.body;

    console.log('id',id)
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tag ID is required.',
      });
    }
    if (!url_slug || !title_en || !title_ur || !description_ur || !description_en ||
      !start_date || !end_date ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: slug, title_en, title_ur , description_ur , description_en , start_date , end_date are required.',
      });
    }

    const result = await parhaiyanService.updateParhaiyan({ id, title_en, title_ur ,description_ur ,description_en ,start_date ,end_date ,url_slug , is_active });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found or update failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tag updated successfully.',
    });

  } catch (error) {
    logger.error(`Error updating tag: ${error.message}`);
    return next(error);
  }
};

exports.deleteParhaiyan = async (req, res, next) => {
 
  try {
    const { id } = req.params;
    const result = await parhaiyanService.deleteParhaiyan(id);
    return res.json(result);
  } catch (error) {
    logger.error('Error deleting Parhaiyan:', error);
    return next(error);
  }
};

exports.activeParhaiyans = async (req, res, next) => {
  try {
    const result = await parhaiyanService.activeParhaiyan();
    return res.json(result);
  } catch (error) {
    logger.error('Error getting active Parhaiyan:', error);
    return next(error);
  }
};

exports.getParhaiyanBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await parhaiyanService.getParhaiyanBySlug(slug);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Parhaiyan not found',
      });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error fetching parhaiyan by slug:', error);
    return next(error);
  }
};

