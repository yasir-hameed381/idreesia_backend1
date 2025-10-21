const { Op } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const mehfil_reports = require("../models/mehfilReports")(db);

// Create Mehfil Report
exports.createMehfilReport = async (data) => {
  const result = await mehfil_reports.create(data);
  return result;
};

// Get All Mehfil Reports (with pagination + search)
exports.getMehfilReports = async ({
  page = 1,
  size = 10,
  search = "",
  requestUrl,
}) => {
  const limit = parseInt(size) || 10;
  const offset = (parseInt(page) - 1) * limit;

  const whereClause = search
    ? {
        [Op.or]: [
          { report_month: { [Op.like]: `%${search}%` } },
          { report_year: { [Op.like]: `%${search}%` } },
          { zone_id: { [Op.like]: `%${search}%` } },
          { coordinator_name: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  const { count, rows } = await mehfil_reports.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    success: true,
    totalItems: count,
    totalPages,
    currentPage: parseInt(page),
    pageSize: limit,
    data: rows,
    requestUrl,
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
