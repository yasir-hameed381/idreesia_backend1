const logger = require("../../config/logger");
const karkunService = require("../services/karkunService");

exports.createKarkun = async (req, res, next) => {
  try {
    const {
      zone,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfile_admin,
      user_type,
      father_name,
      mobile_no,
      cnic_no,
      address,
      birth_year,
      ehad_year,
      mehfile,
      duty_days,
      duty_type,
    } = req.body;

    const result = await karkunService.createKarkun({
      zone,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfile_admin,
      user_type,
      father_name,
      mobile_no,
      cnic_no,
      address,
      birth_year,
      ehad_year,
      mehfile,
      duty_days,
      duty_type,
    });
    return res.status(201).json({
      success: true,
      message: "karkun created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating karkun: ${error.message}`);
    return next(error);
  }
};

exports.getKarkun = async (req, res, next) => {
  try {
    // Construct requestUrl for pagination links
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
    const { page, size, search } = req.query;
    
    // Parse and validate parameters
    const pageNum = parseInt(page, 10) || 1;
    const sizeNum = parseInt(size, 10) || 50;
    
    const result = await karkunService.getKarkun({
      page: pageNum,
      size: sizeNum,
      search: search || "",
      requestUrl: baseUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching karkuns:", error);
    logger.error("Error message:", error.message);
    logger.error("Error stack:", error.stack);
    return next(error);
  }
};

exports.getKarkunById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "karkun id not found" });
    }
    const result = await karkunService.getKarkunById(id);

    if (!result || !result.success) {
      return res.status(404).json(result || { success: false, message: "karkun not found" });
    }
    return res.json(result);
  } catch (error) {
    console.error("error fetching karkuns", error);
    logger.error("Error fetching karkuns:", error);
    return next(error);
  }
};

exports.updateKarkun = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      zone,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfile_admin,
      user_type,
      father_name,
      mobile_no,
      cnic_no,
      address,
      birth_year,
      ehad_year,
      mehfile,
      duty_days,
      duty_type,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "karkun ID is required.",
      });
    }

    // if (!title_en || !title_ur || !country_en || !country_ur || !city_en || !city_ur) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Missing required fields: title_en , title_ur , country_en , country_ur , city_en , city_ur are required.',
    //   });
    // }

    const result = await karkunService.updateKarkun({
      id,
      zone,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfile_admin,
      user_type,
      father_name,
      mobile_no,
      cnic_no,
      address,
      birth_year,
      ehad_year,
      mehfile,
      duty_days,
      duty_type,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "karkun not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "karkun updated successfully.",
    });
  } catch (error) {
    logger.error(`Error updating karkun: ${error.message}`);
    return next(error);
  }
};

exports.deleteKarkun = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Karkun ID is required",
      });
    }

    const result = await karkunService.deleteKarkun(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error deleting karkun: ${error.message}`);
    return next(error);
  }
};
