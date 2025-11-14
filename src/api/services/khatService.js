const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const { paginate, constructPagination } = require("./utilityServices");

const KhatModel = require("../models/khat")(db);
const zoneModel = require("../models/zone")(db);
const mehfilDirectoryModel = require("../models/mehfil-directories")(db);

const KHAT_FIELDS = [
  "zone_id",
  "mehfil_directory_id",
  "email",
  "phone_number",
  "full_name",
  "father_name",
  "introducer_name",
  "age",
  "ehad_duration",
  "address",
  "city",
  "last_tarteeb",
  "consistent_in_wazaif",
  "consistent_in_prayers",
  "consistent_in_ishraq",
  "makes_up_missed_prayers",
  "missed_prayers",
  "can_read_quran",
  "multan_visit_frequency",
  "mehfil_attendance_frequency",
  "is_submitted_before",
  "last_submission_wazaifs",
  "kalimah_quantity",
  "allah_quantity",
  "laa_ilaaha_illallah_quantity",
  "sallallahu_alayhi_wasallam_quantity",
  "astagfirullah_quantity",
  "ayat_ul_kursi_quantity",
  "dua_e_talluq_quantity",
  "dua_e_waswasey_quantity",
  "additional_wazaif_reading",
  "description",
  "reciter_relation",
  "reciter_name",
  "reciter_age",
  "reciter_ehad_duration",
  "reciter_consistent_in_wazaif",
  "reciter_consistent_in_prayers",
  "reciter_makes_up_missed_prayers",
  "reciter_missed_prayers",
  "reciter_can_read_quran",
  "reciter_multan_visit_frequency",
  "reciter_mehfil_attendance_frequency",
  "type",
  "status",
  "jawab",
  "jawab_links",
  "notes",
  "created_by",
  "updated_by",
];

const KHAT_SEARCH_FIELDS = [
  "full_name",
  "email",
  "phone_number",
  "father_name",
  "introducer_name",
];

let associationsInitialized = false;

const initializeAssociations = () => {
  if (associationsInitialized) {
    return;
  }

  if (!KhatModel.associations?.zone) {
    KhatModel.belongsTo(zoneModel, {
      foreignKey: "zone_id",
      as: "zone",
    });
  }

  if (!KhatModel.associations?.mehfilDirectory) {
    KhatModel.belongsTo(mehfilDirectoryModel, {
      foreignKey: "mehfil_directory_id",
      as: "mehfilDirectory",
    });
  }

  associationsInitialized = true;
};

const buildPayload = (payload = {}) => {
  const khatPayload = {};

  KHAT_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      khatPayload[field] = payload[field];
    }
  });

  return khatPayload;
};

const buildPaginationMetadata = ({ count, limit, offset, currentPage, requestUrl }) => {
  const { links, meta } = constructPagination({
    count,
    limit,
    offset,
    currentPage,
    baseUrl: requestUrl,
  });

  return { links, meta };
};

exports.getKhats = async ({
  page = 1,
  size = 25,
  search = "",
  zone_id,
  mehfil_directory_id,
  status,
  type,
  sortField = "created_at",
  sortDirection = "desc",
  requestUrl = "",
}) => {
  try {
    initializeAssociations();
    const { offset, limit, currentPage } = await paginate({ page, size });

    const where = {};

    if (search && KHAT_SEARCH_FIELDS.length > 0) {
      where[Op.or] = KHAT_SEARCH_FIELDS.map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }

    if (zone_id) {
      where.zone_id = zone_id;
    }

    if (mehfil_directory_id) {
      where.mehfil_directory_id = mehfil_directory_id;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    const sortableFields = ["id", "full_name", "created_at", "status", "type"];
    const normalizedSortField = sortableFields.includes(sortField)
      ? sortField
      : "created_at";
    const normalizedSortDirection =
      typeof sortDirection === "string" && sortDirection.toLowerCase() === "asc"
        ? "ASC"
        : "DESC";

    const { count, rows } = await KhatModel.findAndCountAll({
      where,
      include: [
        {
          model: zoneModel,
          as: "zone",
          attributes: ["id", "title_en", "title_ur", "city_en", "city_ur"],
        },
        {
          model: mehfilDirectoryModel,
          as: "mehfilDirectory",
          attributes: ["id", "mehfil_number", "name_en", "name_ur"],
        },
      ],
      order: [[normalizedSortField, normalizedSortDirection]],
      offset,
      limit,
    });

    const pagination = buildPaginationMetadata({
      count,
      limit,
      offset,
      currentPage,
      requestUrl,
    });

    return {
      success: true,
      data: rows,
      ...pagination,
    };
  } catch (error) {
    logger.error(`Error fetching khatoot: ${error.message}`, {
      stack: error.stack,
    });
    throw error;
  }
};

exports.getKhatById = async (id) => {
  try {
    initializeAssociations();

    const khat = await KhatModel.findByPk(id, {
      include: [
        {
          model: zoneModel,
          as: "zone",
          attributes: ["id", "title_en", "title_ur", "city_en", "city_ur"],
        },
        {
          model: mehfilDirectoryModel,
          as: "mehfilDirectory",
          attributes: ["id", "mehfil_number", "name_en", "name_ur"],
        },
      ],
    });

    if (!khat) {
      return {
        success: false,
        message: "Khat record not found.",
      };
    }

    return {
      success: true,
      data: khat,
    };
  } catch (error) {
    logger.error(`Error fetching khat by id: ${error.message}`);
    throw error;
  }
};

exports.createKhat = async (payload) => {
  try {
    initializeAssociations();
    const khatPayload = buildPayload(payload);
    khatPayload.created_at = new Date();
    khatPayload.updated_at = new Date();

    const khat = await KhatModel.create(khatPayload);

    return {
      success: true,
      data: khat,
    };
  } catch (error) {
    logger.error(`Error creating khat: ${error.message}`);
    throw error;
  }
};

exports.updateKhat = async (id, payload) => {
  try {
    const khatPayload = buildPayload(payload);
    khatPayload.updated_at = new Date();

    const [affectedRows] = await KhatModel.update(khatPayload, {
      where: { id },
    });

    if (!affectedRows) {
      return {
        success: false,
        message: "Khat record not found or update failed.",
      };
    }

    return {
      success: true,
      message: "Khat record updated successfully.",
    };
  } catch (error) {
    logger.error(`Error updating khat: ${error.message}`);
    throw error;
  }
};

exports.updateKhatStatus = async (id, status) => {
  try {
    const [affectedRows] = await KhatModel.update(
      { status, updated_at: new Date() },
      { where: { id } }
    );

    if (!affectedRows) {
      return {
        success: false,
        message: "Khat record not found or status update failed.",
      };
    }

    return {
      success: true,
      message: "Khat status updated successfully.",
    };
  } catch (error) {
    logger.error(`Error updating khat status: ${error.message}`);
    throw error;
  }
};

exports.deleteKhat = async (id) => {
  try {
    const deleted = await KhatModel.destroy({
      where: { id },
    });

    if (!deleted) {
      return {
        success: false,
        message: "Khat record not found or delete failed.",
      };
    }

    return {
      success: true,
      message: "Khat record deleted successfully.",
    };
  } catch (error) {
    logger.error(`Error deleting khat: ${error.message}`);
    throw error;
  }
};


