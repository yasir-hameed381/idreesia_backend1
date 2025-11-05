const logger = require("../../config/logger");
const adminUsersService = require("../services/adminUsersService");

exports.getAdminUsers = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, size, search } = req.query;
    const result = await adminUsersService.getuserAdmins({
      page,
      size,
      search,
      requestUrl,
    });
    return res.json(result);
  } catch (error) {
    logger.error("Error fetching admin users:", error);
    return next(error);
  }
};

exports.getAdminUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, messsage: "karkun id not found " });
    }
    const result = await adminUsersService.getAdminUserById(id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (error) {
    console.error(error.message);
    logger.error("Error fetching admin user:", error);
  }
};

exports.createAdminUser = async (req, res, next) => {
  try {
    const {
      zone_id,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form,
      region_id,
      role_id,
      role_ids
    } = req.body;

    const result = await adminUsersService.createAdminUser({
      zone_id,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form,
      region_id,
      role_id
    });
    return res.status(201).json({
      success: true,
      message: "admin user created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating admin user: ${error.message}`);
    return next(error);
  }
};

exports.updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      zone_id,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form,
      region_id,
      role_id,
      role_ids
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "admin user id not found",
      });
    }

    const result = await adminUsersService.updateAdminUser({
      id,
      zone_id,
      name,
      email,
      password,
      city,
      country,
      is_zone_admin,
      is_mehfil_admin,
      is_super_admin,
      is_region_admin,
      user_type,
      father_name,
      phone_number,
      id_card_number,
      address,
      birth_year,
      ehad_year,
      mehfil_directory_id,
      duty_days,
      duty_type,
      is_active,
      affidavit_form_file,
      has_affidavit_form,
      region_id,
      role_id,
      role_ids
    });

    console.log("result =========", result.success);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error updated admin user: ${error.message}`);
    return next(error);
  }
};

exports.deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "admin user id is required",
      });
    }
    const result = await adminUsersService.deleteAdminUser(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error("error deleting admin user", error.message);
    throw new Error("failed to delete admin user", error.message);
  }
};
