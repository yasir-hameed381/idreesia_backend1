const logger = require('../../config/logger');
const mehfilDirectoryService = require('../services/mehfilDirectionService');

exports.getMehfilDirections = async (req, res, next) => {
 
  try {
    const requestUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { page, size, zoneId , search } = req.query;
    const result = await mehfilDirectoryService.getMehfilDirections({ page, size, zoneId, search ,requestUrl });
    return res.json(result);
  } catch (error) {
    logger.error('Error fetching mehfil-directories:', error);
    return next(error);
  }
};


exports.createMehfilDirection = async (req, res, next) => {
  try {
    const { zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description,
    } = req.body;

    if (    !zone_id ||
            !mehfil_number||
            !name_en||
            !name_ur||
            !address_en||
            !address_ur||
            !city_en||
            !city_ur||
            !country_en||
            !country_ur)  {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: zone_id , mehfil_number , name_en ,address_en,address_ur, name_ur , city_en , city_ur,country_en,country_ur are required.',
      });
    }

    const result = await mehfilDirectoryService.createMehfilDirection({ zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description });
    return res.status(201).json({
      success: true,
      message: 'Mehfil directory created successfully',
      data: result,
    });

  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    return next(error);
  }
};

exports.updateMehfilDirection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Mehfill Dirictory ID is required.',
      });
    }

    if (    !zone_id ||
            !mehfil_number||
            !name_en||
            !name_ur||
            !address_en||
            !address_ur||
            !city_en||
            !city_ur||
            !country_en||
            !country_ur) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: zone_id , mehfil_number , name_en ,address_en,address_ur, name_ur , city_en , city_ur,country_en,country_ur are required.',
      });
    }

    const result = await mehfilDirectoryService.updateMehfilDirection({ id, zone_id,
            is_published,
            mehfil_number,
            name_en,
            name_ur,
            address_en,
            address_ur,
            city_en,
            city_ur,
            country_en,
            country_ur,
            google_location,
            mediacell_co,
            co_phone_number,
            zimdar_bhai,
            zimdar_bhai_phone_number,
            zimdar_bhai_phone_number_2,
            zimdar_bhai_phone_number_3,
            sarkari_rent,
            mehfil_open,
            ipad_serial_number,
            description });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Mehfil Directory not found or update failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mehfil Directory updated successfully.',
    });

  } catch (error) {
    logger.error(`Error updating Mehfil Directory: ${error.message}`);
    return next(error);
  }
};

exports.deleteMehfilDirection = async (req, res, next) => {
 
  try {
    const { id } = req.params;
    const result = await mehfilDirectoryService.deleteMehfilDirection(id);
    return res.json(result);
  } catch (error) {
    logger.error('Error deleting Mehfil Directory:', error);
    return next(error);
  }
};

exports.getDirectionById = async (req, res, next) => {
 
  try {
    const { id } = req.params;
    const result = await mehfilDirectoryService.getDirectionById(id);
    return res.json(result);
  } catch (error) {
    logger.error('Error get Mehfil Directory By id:', error);
    return next(error);
  }
};

