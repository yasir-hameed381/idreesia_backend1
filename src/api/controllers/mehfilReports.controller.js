const logger = require("../../config/logger");
const mehfilReportsService = require("../services/mehfilReportsService");

// Create Mehfil Report
exports.createMehfilReport = async (req, res, next) => {
  try {
    const {
      report_month,
      report_year,
      zone_id,
      mehfil_directory_id,
      ehad_karkun_id,
      coordinator_name,
      coordinator_monthly_attendance_days,
      total_duty_karkuns,
      attendance_below_50_percent_karkuns,
      consistently_absent_karkuns,
      ehad_karkuns_monthly_attendance_days,
      new_ehads_in_month,
      mehfil_days_in_month,
      multan_duty_karkuns,
      taleemat_e_karima_read,
      sawari_and_bhangra_held,
      daily_karkuns_attendance,
      monthly_main_mehfil_karkuns_attendance,
      naam_mubarak_meeting_karkuns_attendance,
      all_karkuns_meeting_attendance,
      mashwara_meeting_date,
      mashwara_meeting_participant_karkuns,
      monthly_meeting_agenda_details,
    } = req.body;

    const result = await mehfilReportsService.createMehfilReport({
      report_month,
      report_year,
      zone_id,
      mehfil_directory_id,
      ehad_karkun_id,
      coordinator_name,
      coordinator_monthly_attendance_days,
      total_duty_karkuns,
      attendance_below_50_percent_karkuns,
      consistently_absent_karkuns,
      ehad_karkuns_monthly_attendance_days,
      new_ehads_in_month,
      mehfil_days_in_month,
      multan_duty_karkuns,
      taleemat_e_karima_read,
      sawari_and_bhangra_held,
      daily_karkuns_attendance,
      monthly_main_mehfil_karkuns_attendance,
      naam_mubarak_meeting_karkuns_attendance,
      all_karkuns_meeting_attendance,
      mashwara_meeting_date,
      mashwara_meeting_participant_karkuns,
      monthly_meeting_agenda_details,
    });

    return res.status(201).json({
      success: true,
      message: "Mehfil Report created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating Mehfil Report: ${error.message}`);
    return next(error);
  }
};

// Get All Mehfil Reports
exports.getMehfilReports = async (req, res, next) => {
  try {
    const requestUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const q = req.query;
    const page = q.page ?? 1;
    const size = q.size ?? q.per_page ?? 10;
    const search = q.search ?? "";
    const zone_id = q.zone_id ?? q.zone ?? null;
    const report_year = q.report_year ?? q.year ?? null;
    const report_month = q.report_month ?? q.month ?? null;
    const mehfil_directory_id = q.mehfil_directory_id ?? null;
    const region_id = q.region_id ?? null;
    const sort_by = q.sort_by ?? "created_at";
    const sort_direction = q.sort_direction ?? "desc";

    const result = await mehfilReportsService.getMehfilReports({
      page,
      size,
      search,
      zone_id,
      report_month,
      report_year,
      mehfil_directory_id,
      region_id,
      sort_by,
      sort_direction,
      requestUrl,
    });

    return res.json(result);
  } catch (error) {
    logger.error("Error fetching Mehfil Reports:", error);
    return next(error);
  }
};

// Get Mehfil Report By ID
exports.getMehfilReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Mehfil Report ID is required" });
    }

    const result = await mehfilReportsService.getMehfilReportById(id);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error fetching Mehfil Report by ID: ${error.message}`);
    return next(error);
  }
};

// Update Mehfil Report
exports.updateMehfilReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Mehfil Report ID is required.",
      });
    }

    const result = await mehfilReportsService.updateMehfilReport(
      id,
      updateData
    );

    return res.status(200).json({
      success: true,
      message: "Mehfil Report updated successfully.",
      data: result,
    });
  } catch (error) {
    logger.error(`Error updating Mehfil Report: ${error.message}`);
    return next(error);
  }
};

// Delete Mehfil Report
exports.deleteMehfilReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Mehfil Report ID is required",
      });
    }

    const result = await mehfilReportsService.deleteMehfilReport(id);

    return res.status(200).json({
      success: true,
      message: "Mehfil Report deleted successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error deleting Mehfil Report: ${error.message}`);
    return next(error);
  }
};
