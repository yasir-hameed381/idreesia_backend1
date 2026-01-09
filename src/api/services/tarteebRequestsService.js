const logger = require("../../config/logger");
const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const TarteebRequestModel = require("../models/tarteebRequests")(db);
const {
  paginate,
  constructPagination,
} = require("../services/utilityServices");

const TARTEEB_REQUEST_FIELDS = [
  "zone_id",
  "mehfil_directory_id",
  "email",
  "phone_number",
  "full_name",
  "father_name",
  "age",
  "gender",
  "city",
  "country",
  "introducer_name",
  "ehad_duration",
  "source_of_income",
  "education",
  "marital_status",
  "consistent_in_wazaif",
  "consistent_in_prayers",
  "missed_prayers",
  "makes_up_missed_prayers",
  "nawafil",
  "can_read_quran",
  "consistent_in_ishraq",
  "consistent_in_tahajjud",
  "amount_of_durood",
  "listens_taleem_daily",
  "last_wazaif_tarteeb",
  "multan_visit_frequency",
  "mehfil_attendance_frequency",
  "household_members_in_ehad",
  "reads_current_wazaif_with_ease",
  "able_to_read_additional_wazaif",
  "wazaif_consistency_duration",
  "does_dum_taweez",
  "kalimah_quantity",
  "allah_quantity",
  "laa_ilaaha_illallah_quantity",
  "sallallahu_alayhi_wasallam_quantity",
  "astagfirullah_quantity",
  "ayat_ul_kursi_quantity",
  "dua_e_talluq_quantity",
  "subhanallah_quantity",
  "dua_e_waswasey_quantity",
  "other_wazaif",
  "wazaif_not_reading",
  "additional_wazaif_reading",
  "issues_facing",
  "status",
  "jawab",
  "jawab_links",
  "notes",
  "created_by",
  "updated_by",
];

const TARTEEB_REQUEST_SEARCH_FIELDS = [
  "full_name",
  "email",
  "phone_number",
  "city",
  "country",
  "introducer_name",
  "status",
];

const buildPayload = (payload) => {
  const requestPayload = {};

  TARTEEB_REQUEST_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      requestPayload[field] = payload[field];
    }
  });

  return requestPayload;
};

exports.getTarteebRequests = async ({
  page = 1,
  size = 25,
  search = "",
  status,
  zone_id,
  requestUrl = "",
}) => {
  try {
    const { offset, limit, currentPage } = await paginate({ page, size });

    const where = {};

    if (search && TARTEEB_REQUEST_SEARCH_FIELDS.length > 0) {
      where[Op.or] = TARTEEB_REQUEST_SEARCH_FIELDS.map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (zone_id) {
      where.zone_id = zone_id;
    }

    const { count, rows: data } = await TarteebRequestModel.findAndCountAll({
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
    logger.error(`Error fetching tarteeb requests: ${error.message}`);
    throw error;
  }
};

exports.getTarteebRequestById = async (id) => {
  try {
    const tarteebRequest = await TarteebRequestModel.findByPk(id);

    if (!tarteebRequest) {
      return {
        success: false,
        message: "Tarteeb request not found.",
      };
    }

    return {
      success: true,
      data: tarteebRequest,
    };
  } catch (error) {
    logger.error(`Error fetching tarteeb request by id: ${error.message}`);
    throw error;
  }
};

exports.createTarteebRequest = async (payload) => {
  try {
    const tarteebRequestPayload = buildPayload(payload);

    tarteebRequestPayload.created_at = new Date();
    tarteebRequestPayload.updated_at = new Date();

    const tarteebRequest = await TarteebRequestModel.create(tarteebRequestPayload);

    return {
      success: true,
      data: tarteebRequest,
    };
  } catch (error) {
    logger.error(`Error creating tarteeb request: ${error.message}`);
    throw error;
  }
};

exports.updateTarteebRequest = async (id, payload) => {
  try {
    const tarteebRequestPayload = buildPayload(payload);
    tarteebRequestPayload.updated_at = new Date();

    const [affectedRows] = await TarteebRequestModel.update(tarteebRequestPayload, {
      where: { id },
    });

    if (!affectedRows) {
      return {
        success: false,
        message: "Tarteeb request not found or update failed.",
      };
    }

    return {
      success: true,
      message: "Tarteeb request updated successfully.",
    };
  } catch (error) {
    logger.error(`Error updating tarteeb request: ${error.message}`);
    throw error;
  }
};

exports.deleteTarteebRequest = async (id) => {
  try {
    const deleted = await TarteebRequestModel.destroy({
      where: { id },
    });

    if (!deleted) {
      return {
        success: false,
        message: "Tarteeb request not found or delete failed.",
      };
    }

    return {
      success: true,
      message: "Tarteeb request deleted successfully.",
    };
  } catch (error) {
    logger.error(`Error deleting tarteeb request: ${error.message}`);
    throw error;
  }
};

// Token management for public form links
const TarteebFormTokenModel = require("../models/tarteebFormTokens")(db);
const crypto = require("crypto");

exports.generatePublicLinkToken = async ({ linkExpiryHours, createdBy, zoneId, mehfilDirectoryId }) => {
  try {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(linkExpiryHours, 10));

    // Store token in database
    const tokenRecord = await TarteebFormTokenModel.create({
      token,
      expires_at: expiresAt,
      created_by: createdBy || null,
      zone_id: zoneId || null,
      mehfil_directory_id: mehfilDirectoryId || null,
      used: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clean up expired tokens (run asynchronously)
    TarteebFormTokenModel.destroy({
      where: {
        expires_at: { [Op.lt]: new Date() },
      },
    }).catch((err) => {
      // Silently fail cleanup
    });

    return {
      success: true,
      data: {
        token,
        expires_at: expiresAt,
      },
    };
  } catch (error) {
    logger.error(`Error generating public link token: ${error.message}`, error.stack);
    // Check if it's a table not found error
    if (error.message && error.message.includes("doesn't exist")) {
      throw new Error(`Database table 'tarteeb_form_tokens' does not exist. Please run the migration: database/migrations/create_tarteeb_form_tokens_table.sql`);
    }
    throw error;
  }
};

exports.validatePublicLinkToken = async (token) => {
  try {
    const tokenRecord = await TarteebFormTokenModel.findOne({
      where: { token },
    });

    if (!tokenRecord) {
      return {
        success: false,
        valid: false,
        message: "Invalid token.",
      };
    }

    // Check if expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
      return {
        success: false,
        valid: false,
        message: "Token has expired.",
      };
    }

    // Check if already used
    if (tokenRecord.used === 1) {
      return {
        success: false,
        valid: false,
        message: "Token has already been used.",
      };
    }

    return {
      success: true,
      valid: true,
      data: {
        zone_id: tokenRecord.zone_id,
        mehfil_directory_id: tokenRecord.mehfil_directory_id,
        created_by: tokenRecord.created_by,
      },
    };
  } catch (error) {
    logger.error(`Error validating public link token: ${error.message}`);
    throw error;
  }
};

exports.markTokenAsUsed = async (token) => {
  try {
    const [affectedRows] = await TarteebFormTokenModel.update(
      {
        used: 1,
        used_at: new Date(),
        updated_at: new Date(),
      },
      {
        where: { token },
      }
    );

    if (!affectedRows) {
      return {
        success: false,
        message: "Token not found.",
      };
    }

    return {
      success: true,
      message: "Token marked as used.",
    };
  } catch (error) {
    logger.error(`Error marking token as used: ${error.message}`);
    throw error;
  }
};

