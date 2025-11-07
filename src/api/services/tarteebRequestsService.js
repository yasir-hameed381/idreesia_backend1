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

