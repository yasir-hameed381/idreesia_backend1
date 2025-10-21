const logger = require('../../config/logger');
const ehadKarkunService = require('../services/ehadKarkunService');

exports.getEhadKarkun = async (req, res, next) => {
 
  try {
    const requestUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { page, size, search } = req.query;
    const result = await ehadKarkunService.getEhadKarkun({ page, size, search ,requestUrl });
    return res.json(result);
  } catch (error) {
    logger.error('Error fetching Categories:', error);
    return next(error);
  }
};

exports.createEhadKarkun = async (req, res, next) => {
  try {
    const { zone_id,
  name_en,
  name_ur,
  so_en,
  so_ur,
  mobile_no,
  cnic,
  city_en,
  city_ur,
  country_en,
  country_ur,
  birth_year,
  ehad_year,
  ehad_ijazat_year,
  description
    } = req.body;

    // if (!title_en || !title_ur || !country_en || !country_ur || !city_en || !city_ur)  {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Missing required fields: title_en , title_ur , country_en , country_ur , city_en , city_ur are required.',
    //   });
    // }

    const result = await ehadKarkunService.createEhadKarkun({ zone_id,
  name_en,
  name_ur,
  so_en,
  so_ur,
  mobile_no,
  cnic,
  city_en,
  city_ur,
  country_en,
  country_ur,
  birth_year,
  ehad_year,
  ehad_ijazat_year,
  description });
    return res.status(201).json({
      success: true,
      message: 'Zone created successfully',
      data: result,
    });

  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    return next(error);
  }
};

exports.updateEhadKarkun = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { zone_id,
  name_en,
  name_ur,
  so_en,
  so_ur,
  mobile_no,
  cnic,
  city_en,
  city_ur,
  country_en,
  country_ur,
  birth_year,
  ehad_year,
  ehad_ijazat_year,
  description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Zone ID is required.',
      });
    }

    // if (!title_en || !title_ur || !country_en || !country_ur || !city_en || !city_ur) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Missing required fields: title_en , title_ur , country_en , country_ur , city_en , city_ur are required.',
    //   });
    // }

    const result = await ehadKarkunService.updateEhadKarkun({ id, zone_id,
  name_en,
  name_ur,
  so_en,
  so_ur,
  mobile_no,
  cnic,
  city_en,
  city_ur,
  country_en,
  country_ur,
  birth_year,
  ehad_year,
  ehad_ijazat_year,
  description });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found or update failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Zone updated successfully.',
    });

  } catch (error) {
    logger.error(`Error updating Zone: ${error.message}`);
    return next(error);
  }
};

exports.deleteEhadKarkun = async (req, res, next) => {
 
  try {
    const { id } = req.params;
    const result = await ehadKarkunService.deleteEhadKarkun(id);
    return res.json(result);
  } catch (error) {
    logger.error('Error deleting Zone:', error);
    return next(error);
  }
};

