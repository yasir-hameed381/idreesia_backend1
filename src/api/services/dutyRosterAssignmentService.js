const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const dutyRosterAssignmentModel = require("../models/dutyRosterAssignment")(db);
const dutyTypeModel = require("../models/dutyType")(db);
const dutyRosterModel = require("../models/dutyRoster")(db);

/**
 * Create a new duty roster assignment
 */
exports.createAssignment = async (data) => {
  try {
    const { duty_roster_id, duty_type_id, day } = data;

    // Check if assignment already exists
    const existing = await dutyRosterAssignmentModel.findOne({
      where: {
        duty_roster_id,
        duty_type_id,
        day: day.toLowerCase(),
      },
    });

    if (existing) {
      throw new Error("This duty is already assigned for this day.");
    }

    // Check if coordinator already exists for this day (special case)
    const dutyType = await dutyTypeModel.findByPk(duty_type_id);
    if (dutyType && dutyType.name.toLowerCase() === "coordinator") {
      // Get the duty roster to find mehfil_directory_id
      const roster = await dutyRosterModel.findByPk(duty_roster_id);
      
      if (roster && roster.mehfil_directory_id) {
        // Find all rosters for this mehfil
        const mehfilRosters = await dutyRosterModel.findAll({
          where: { mehfil_directory_id: roster.mehfil_directory_id },
        });
        
        const rosterIds = mehfilRosters.map((r) => r.id);
        
        const coordinatorExists = await dutyRosterAssignmentModel.findOne({
          where: {
            duty_roster_id: { [Op.in]: rosterIds },
            duty_type_id,
            day: day.toLowerCase(),
          },
        });

        if (coordinatorExists) {
          throw new Error(
            "A coordinator is already assigned for this day. Only one coordinator per day is allowed."
          );
        }
      }
    }

    const assignment = await dutyRosterAssignmentModel.create({
      duty_roster_id,
      duty_type_id,
      day: day.toLowerCase(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    return assignment;
  } catch (error) {
    logger.error(`Error creating duty roster assignment: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a duty roster assignment
 */
exports.deleteAssignment = async (id) => {
  try {
    const assignment = await dutyRosterAssignmentModel.findByPk(id);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await assignment.destroy();
    return { success: true, message: "Assignment deleted successfully" };
  } catch (error) {
    logger.error(`Error deleting duty roster assignment: ${error.message}`);
    throw error;
  }
};

/**
 * Get assignments by duty roster ID
 */
exports.getAssignmentsByRosterId = async (rosterId) => {
  try {
    const assignments = await dutyRosterAssignmentModel.findAll({
      where: { duty_roster_id: rosterId },
      include: [
        {
          model: dutyTypeModel,
          as: "dutyType",
          required: false,
        },
      ],
      order: [["day", "ASC"]],
    });

    return assignments;
  } catch (error) {
    logger.error(
      `Error fetching assignments by roster ID: ${error.message}`
    );
    throw error;
  }
};

