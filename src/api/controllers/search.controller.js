const logger = require('../../config/logger');
const searchService = require('../services/searchService');


exports.search = async (req, res, next) => {
  try {
    const { query,type } = req.query;
    const result = await searchService.search({ query, type });
    return res.json(result);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

