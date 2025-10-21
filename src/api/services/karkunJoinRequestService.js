const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const karkunJoinRequestModel = require("../models/karkunJoinRequests")(db);
const {
  paginate,
  constructPagination,
} = require("../services/utilityServices");

exports.getKarkunJoinRequests = async ({
  page = 1,
  size = 25,
  search = "",
  requestUrl = "",
}) => {
  try {
    const searchFields = [
      "first_name",
      "last_name",
      "email",
      "phone_no",
      "city",
      "country",
      "user_type",
    ];

    const { offset, limit, currentPage } = await paginate({ page, size });

    const where = {};

    if (search && searchFields.length > 0) {
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }

    const { count, rows: data } = await karkunJoinRequestModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    return {
      success: true,
      data,
      links,
      meta,
    };
  } catch (error) {
    logger.error("Error fetching karkun join requests: " + error.message);
    throw error;
  }
};

exports.getKarkunJoinRequestById = async (id) => {
  try {
    const request = await karkunJoinRequestModel.findByPk(id);
    if (!request) {
      return { success: false, message: "Karkun join request not found." };
    }
    return { success: true, data: request };
  } catch (error) {
    logger.error("Error fetching karkun join request by id: " + error.message);
    throw error;
  }
};

exports.createKarkunJoinRequest = async (payload) => {
  try {
    const newRequest = await karkunJoinRequestModel.create({
      avatar: payload.avatar || null,
      first_name: payload.first_name,
      last_name: payload.last_name || null,
      email: payload.email,
      phone_no: payload.phone_no || null,
      user_type: payload.user_type || null,
      birth_year: payload.birth_year || null,
      ehad_year: payload.ehad_year || null,
      zone_id: payload.zone_id || null,
      city: payload.city || null,
      country: payload.country || null,
      is_approved: payload.is_approved ?? 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return { success: true, data: newRequest };
  } catch (error) {
    logger.error("Error creating karkun join request: " + error.message);
    throw error;
  }
};

exports.updateKarkunJoinRequest = async (id, payload) => {
  try {
    const [updated] = await karkunJoinRequestModel.update(
      {
        avatar: payload.avatar || null,
        first_name: payload.first_name,
        last_name: payload.last_name || null,
        email: payload.email,
        phone_no: payload.phone_no || null,
        user_type: payload.user_type || null,
        birth_year: payload.birth_year || null,
        ehad_year: payload.ehad_year || null,
        zone_id: payload.zone_id || null,
        city: payload.city || null,
        country: payload.country || null,
        is_approved: payload.is_approved ?? 0,
        updated_at: new Date(),
      },
      { where: { id } }
    );

    if (!updated) {
      return {
        success: false,
        message: "Karkun join request not found or update failed.",
      };
    }

    return {
      success: true,
      message: "Karkun join request updated successfully.",
    };
  } catch (error) {
    logger.error("Error updating karkun join request: " + error.message);
    throw error;
  }
};

exports.deleteKarkunJoinRequest = async (id) => {
  try {
    const deleted = await karkunJoinRequestModel.destroy({ where: { id } });

    if (!deleted) {
      return {
        success: false,
        message: "Karkun join request not found or delete failed.",
      };
    }

    return {
      success: true,
      message: "Karkun join request deleted successfully.",
    };
  } catch (error) {
    logger.error("Error deleting karkun join request: " + error.message);
    throw error;
  }
};
