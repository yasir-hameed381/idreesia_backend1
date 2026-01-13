const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const { paginate, constructPagination } = require("./utilityServices");

const KhatModel = require("../models/khat")(db);
const KhatQuestionModel = require("../models/khatQuestions")(db);
const zoneModel = require("../models/zone")(db);
const mehfilDirectoryModel = require("../models/mehfil-directories")(db);
const userModel = require("../models/user-admin")(db);

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

  if (!KhatModel.associations?.questions) {
    KhatModel.hasMany(KhatQuestionModel, {
      foreignKey: "khat_id",
      as: "questions",
    });
  }

  if (!KhatQuestionModel.associations?.khat) {
    KhatQuestionModel.belongsTo(KhatModel, {
      foreignKey: "khat_id",
      as: "khat",
    });
  }

  if (!KhatQuestionModel.associations?.askedBy) {
    KhatQuestionModel.belongsTo(userModel, {
      foreignKey: "asked_by",
      as: "askedBy",
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
        {
          model: KhatQuestionModel,
          as: "questions",
          include: [
            {
              model: userModel,
              as: "askedBy",
              attributes: ["id", "name", "email"],
            },
          ],
          order: [["created_at", "ASC"]],
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

// Token management for public form links
const KhatFormTokenModel = require("../models/khatFormTokens")(db);
const crypto = require("crypto");

exports.generatePublicLinkToken = async ({ linkExpiryHours, createdBy, zoneId, mehfilDirectoryId }) => {
  try {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(linkExpiryHours, 10));

    // Store token in database
    const tokenRecord = await KhatFormTokenModel.create({
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
    KhatFormTokenModel.destroy({
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
      throw new Error(`Database table 'khat_form_tokens' does not exist. Please run the migration: database/migrations/create_khat_form_tokens_table.sql`);
    }
    throw error;
  }
};

exports.validatePublicLinkToken = async (token) => {
  try {
    const tokenRecord = await KhatFormTokenModel.findOne({
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
    const [affectedRows] = await KhatFormTokenModel.update(
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

// Question management methods (similar to Laravel KhatView actions)
exports.addQuestion = async (khatId, question, askedBy = null) => {
  try {
    initializeAssociations();

    // Validate khat exists
    const khat = await KhatModel.findByPk(khatId);
    if (!khat) {
      return {
        success: false,
        message: "Khat record not found.",
      };
    }

    // Validate question
    if (!question || question.trim().length < 10) {
      return {
        success: false,
        message: "Question must be at least 10 characters long.",
      };
    }

    const khatQuestion = await KhatQuestionModel.create({
      khat_id: khatId,
      question: question.trim(),
      asked_by: askedBy || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      data: khatQuestion,
      message: "Question added successfully.",
    };
  } catch (error) {
    logger.error(`Error adding question: ${error.message}`);
    throw error;
  }
};

exports.sendQuestions = async (khatId, questionIds = null, askedBy = null) => {
  try {
    initializeAssociations();

    const khat = await KhatModel.findByPk(khatId);
    if (!khat) {
      return {
        success: false,
        message: "Khat record not found.",
      };
    }

    if (!khat.email) {
      return {
        success: false,
        message: "Cannot send questions - no email address on file.",
      };
    }

    // Get questions to send
    let questions;
    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      questions = await KhatQuestionModel.findAll({
        where: {
          khat_id: khatId,
          id: questionIds,
        },
      });
    } else {
      // Get all unanswered questions
      questions = await KhatQuestionModel.findAll({
        where: {
          khat_id: khatId,
          answer: null,
        },
      });
    }

    if (questions.length === 0) {
      return {
        success: false,
        message: "No questions to send.",
      };
    }

    // Update asked_by for questions if provided
    if (askedBy) {
      await KhatQuestionModel.update(
        { asked_by: askedBy, updated_at: new Date() },
        {
          where: {
            khat_id: khatId,
            id: questions.map((q) => q.id),
          },
        }
      );
    }

    // Update khat status to awaiting_response
    await KhatModel.update(
      {
        status: "awaiting_response",
        updated_at: new Date(),
      },
      {
        where: { id: khatId },
      }
    );

    // TODO: Send email notification here (similar to Laravel's SendKhatQuestionEmail job)
    // For now, we'll just return success

    return {
      success: true,
      message: "Questions sent successfully.",
      data: {
        questionsCount: questions.length,
        questions: questions,
      },
    };
  } catch (error) {
    logger.error(`Error sending questions: ${error.message}`);
    throw error;
  }
};

exports.getQuestions = async (khatId) => {
  try {
    initializeAssociations();

    const khat = await KhatModel.findByPk(khatId);
    if (!khat) {
      return {
        success: false,
        message: "Khat record not found.",
      };
    }

    const questions = await KhatQuestionModel.findAll({
      where: { khat_id: khatId },
      include: [
        {
          model: userModel,
          as: "askedBy",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return {
      success: true,
      data: questions,
    };
  } catch (error) {
    logger.error(`Error fetching questions: ${error.message}`);
    throw error;
  }
};

exports.deleteQuestion = async (questionId) => {
  try {
    const deleted = await KhatQuestionModel.destroy({
      where: { id: questionId },
    });

    if (!deleted) {
      return {
        success: false,
        message: "Question not found or delete failed.",
      };
    }

    return {
      success: true,
      message: "Question deleted successfully.",
    };
  } catch (error) {
    logger.error(`Error deleting question: ${error.message}`);
    throw error;
  }
};

// Update jawab, status, jawab_links, and notes (similar to Laravel's save method)
exports.updateJawab = async (khatId, { status, jawab, jawab_links, notes }) => {
  try {
    const khat = await KhatModel.findByPk(khatId);
    if (!khat) {
      return {
        success: false,
        message: "Khat record not found.",
      };
    }

    const updateData = {
      updated_at: new Date(),
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (jawab !== undefined) {
      updateData.jawab = jawab;
    }

    if (jawab_links !== undefined) {
      // Filter out empty links (similar to Laravel)
      const filteredLinks = Array.isArray(jawab_links)
        ? jawab_links.filter(
            (link) => link && link.title && link.url && link.title.trim() && link.url.trim()
          )
        : null;
      updateData.jawab_links = filteredLinks;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const [affectedRows] = await KhatModel.update(updateData, {
      where: { id: khatId },
    });

    if (!affectedRows) {
      return {
        success: false,
        message: "Failed to update khat.",
      };
    }

    return {
      success: true,
      message: "Khat updated successfully.",
    };
  } catch (error) {
    logger.error(`Error updating khat jawab: ${error.message}`);
    throw error;
  }
};