const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const { sequelize: db } = require("../../config/database");
const mehfil_reports = require("../models/mehfilReports")(db);

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
  requestUrl,
}) => {
  const limit = parseInt(size) || 10;
  const offset = (parseInt(page) - 1) * limit;

  // Build where clause conditions
  const conditions = [];

  // Search filter - create OR conditions for search
  if (search && search.trim()) {
    const searchTerm = search.trim();
    const searchConditions = [];
    
    // Text search on coordinator_name
    searchConditions.push({
      coordinator_name: { [Op.like]: `%${searchTerm}%` }
    });
    
    // Search in numeric fields by casting to string
    // This allows partial matches like "202" matching "2024"
    searchConditions.push(
      Sequelize.where(
        Sequelize.cast(Sequelize.col('mehfil_reports.report_month'), 'CHAR'),
        { [Op.like]: `%${searchTerm}%` }
      )
    );
    searchConditions.push(
      Sequelize.where(
        Sequelize.cast(Sequelize.col('mehfil_reports.report_year'), 'CHAR'),
        { [Op.like]: `%${searchTerm}%` }
      )
    );
    searchConditions.push(
      Sequelize.where(
        Sequelize.cast(Sequelize.col('mehfil_reports.zone_id'), 'CHAR'),
        { [Op.like]: `%${searchTerm}%` }
      )
    );
    searchConditions.push(
      Sequelize.where(
        Sequelize.cast(Sequelize.col('mehfil_reports.mehfil_directory_id'), 'CHAR'),
        { [Op.like]: `%${searchTerm}%` }
      )
    );
    
    // Also try exact numeric match if search term is a number
    const searchNum = parseInt(searchTerm);
    if (!isNaN(searchNum)) {
      searchConditions.push({ report_month: searchNum });
      searchConditions.push({ report_year: searchNum });
      searchConditions.push({ zone_id: searchNum });
      searchConditions.push({ mehfil_directory_id: searchNum });
    }
    
    // Try to match month names
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthIndex = monthNames.findIndex(m => 
      m.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (monthIndex >= 0) {
      searchConditions.push({ report_month: monthIndex + 1 });
    }
    
    if (searchConditions.length > 0) {
      conditions.push({ [Op.or]: searchConditions });
    }
  }

  // Zone filter
  if (zone_id && zone_id.trim()) {
    const zoneIdNum = parseInt(zone_id);
    if (!isNaN(zoneIdNum)) {
      conditions.push({ zone_id: zoneIdNum });
    }
  }

  // Month filter
  if (report_month && report_month.trim()) {
    const monthNum = parseInt(report_month);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      conditions.push({ report_month: monthNum });
    }
  }

  // Year filter
  if (report_year && report_year.trim()) {
    const yearNum = parseInt(report_year);
    if (!isNaN(yearNum)) {
      conditions.push({ report_year: yearNum });
    }
  }

  // Mehfil directory filter
  if (mehfil_directory_id && mehfil_directory_id.trim()) {
    const mehfilId = parseInt(mehfil_directory_id);
    if (!isNaN(mehfilId)) {
      conditions.push({ mehfil_directory_id: mehfilId });
    }
  }

  // Combine all conditions with AND
  // If only one condition, use it directly; otherwise wrap in Op.and
  let whereClause = {};
  if (conditions.length === 1) {
    whereClause = conditions[0];
  } else if (conditions.length > 1) {
    whereClause = { [Op.and]: conditions };
  }

  const { count, rows } = await mehfil_reports.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    meta: {
      total: count,
      current_page: parseInt(page),
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
