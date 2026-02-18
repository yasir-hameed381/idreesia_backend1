const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const mehfil_reports = require("../models/mehfilReports")(db);
const zonesModel = require("../models/zone")(db);

const SAFE_INT = (v) => {
  if (v == null) return null;
  const n = parseInt(String(v).trim(), 10);
  return Number.isNaN(n) ? null : n;
};

const SORT_FIELDS = ["created_at", "coordinator_name"];
const SORT_DIRECTIONS = ["asc", "desc"];

// Create Mehfil Report
exports.createMehfilReport = async (data) => {
  const result = await mehfil_reports.create(data);
  return result;
};

// Get All Mehfil Reports (with pagination + search + filters)
exports.getMehfilReports = async ({
  page = 1,
  size = 10,
  search = "",
  zone_id,
  report_month,
  report_year,
  mehfil_directory_id,
  region_id,
  sort_by = "created_at",
  sort_direction = "desc",
  requestUrl,
}) => {
  const limit = Math.max(1, parseInt(size, 10) || 10);
  const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * limit;

  const conditions = [];

  // Search filter
  const searchStr = typeof search === "string" ? search.trim() : "";
  if (searchStr) {
    const searchConditions = [
      { coordinator_name: { [Op.like]: `%${searchStr}%` } },
      Sequelize.where(
        Sequelize.cast(Sequelize.col("mehfil_reports.report_month"), "CHAR"),
        { [Op.like]: `%${searchStr}%` }
      ),
      Sequelize.where(
        Sequelize.cast(Sequelize.col("mehfil_reports.report_year"), "CHAR"),
        { [Op.like]: `%${searchStr}%` }
      ),
      Sequelize.where(
        Sequelize.cast(Sequelize.col("mehfil_reports.zone_id"), "CHAR"),
        { [Op.like]: `%${searchStr}%` }
      ),
      Sequelize.where(
        Sequelize.cast(Sequelize.col("mehfil_reports.mehfil_directory_id"), "CHAR"),
        { [Op.like]: `%${searchStr}%` }
      ),
    ];
    const searchNum = SAFE_INT(searchStr);
    if (searchNum != null) {
      searchConditions.push({ report_month: searchNum });
      searchConditions.push({ report_year: searchNum });
      searchConditions.push({ zone_id: searchNum });
      searchConditions.push({ mehfil_directory_id: searchNum });
    }
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ];
    const mi = monthNames.findIndex((m) =>
      m.toLowerCase().includes(searchStr.toLowerCase())
    );
    if (mi >= 0) searchConditions.push({ report_month: mi + 1 });
    conditions.push({ [Op.or]: searchConditions });
  }

  // Region filter: restrict to zones in region
  if (SAFE_INT(region_id) != null) {
    const regionIdNum = SAFE_INT(region_id);
    const zoneRows = await zonesModel.findAll({
      where: { region_id: regionIdNum },
      attributes: ["id"],
    });
    const zoneIds = zoneRows.map((z) => z.id);
    if (zoneIds.length) {
      conditions.push({ zone_id: { [Op.in]: zoneIds } });
    } else {
      conditions.push({ id: 0 });
    }
  }

  // Zone filter
  const zoneIdNum = SAFE_INT(zone_id);
  if (zoneIdNum != null) {
    conditions.push({ zone_id: zoneIdNum });
  }

  // Month filter
  const monthNum = SAFE_INT(report_month);
  if (monthNum != null && monthNum >= 1 && monthNum <= 12) {
    conditions.push({ report_month: monthNum });
  }

  // Year filter
  const yearNum = SAFE_INT(report_year);
  if (yearNum != null) {
    conditions.push({ report_year: yearNum });
  }

  // Mehfil directory filter
  const mehfilIdNum = SAFE_INT(mehfil_directory_id);
  if (mehfilIdNum != null) {
    conditions.push({ mehfil_directory_id: mehfilIdNum });
  }

  let whereClause = {};
  if (conditions.length === 1) whereClause = conditions[0];
  else if (conditions.length > 1) whereClause = { [Op.and]: conditions };

  const orderField = SORT_FIELDS.includes(String(sort_by).toLowerCase())
    ? String(sort_by)
    : "created_at";
  const orderDir = SORT_DIRECTIONS.includes(String(sort_direction).toLowerCase())
    ? String(sort_direction).toUpperCase()
    : "DESC";

  const { count, rows } = await mehfil_reports.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[orderField, orderDir]],
  });

  const totalPages = Math.ceil(count / limit) || 1;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  return {
    data: rows,
    meta: {
      total: count,
      current_page: currentPage,
      last_page: totalPages,
      per_page: limit,
    },
  };
};

// Get Mehfil Report By ID
exports.getMehfilReportById = async (id) => {
  const result = await mehfil_reports.findByPk(id);
  if (!result) {
    throw new Error("Mehfil Report not found");
  }
  return result;
};

// Update Mehfil Report
exports.updateMehfilReport = async (id, data) => {
  const result = await mehfil_reports.findByPk(id);
  if (!result) {
    throw new Error("Mehfil Report not found");
  }

  await result.update(data);
  return result;
};

// Delete Mehfil Report
exports.deleteMehfilReport = async (id) => {
  const result = await mehfil_reports.findByPk(id);
  if (!result) {
    throw new Error("Mehfil Report not found");
  }

  await result.destroy();
  return result;
};
