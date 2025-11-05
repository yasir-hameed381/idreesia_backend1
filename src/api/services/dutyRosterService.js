const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const dutyRosterModel = require("../models/dutyRoster")(db);
const dutyRosterAssignmentModel = require("../models/dutyRosterAssignment")(db);
const userModel = require("../models/user-admin")(db);
const dutyTypeModel = require("../models/dutyType")(db);
const mehfilDirectoryModel = require("../models/mehfil-directories")(db);

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Get all duty rosters with assignments (matching Laravel implementation)
 */
exports.getAllDutyRosters = async ({
  zoneId = null,
  mehfilDirectoryId = null,
  userTypeFilter = "karkun",
  search = "",
}) => {
  try {
    if (!zoneId) {
      return {
        success: true,
        showTable: false,
        data: [],
      };
    }

    const whereClause = {
      zone_id: zoneId,
    };

    if (mehfilDirectoryId) {
      whereClause.mehfil_directory_id = mehfilDirectoryId;
    }

    // Build user filter
    const userWhere = {
      user_type: userTypeFilter,
      is_super_admin: false,
    };

    if (userTypeFilter === "karkun") {
      if (mehfilDirectoryId) {
        userWhere.mehfil_directory_id = mehfilDirectoryId;
      }
      userWhere.is_mehfil_admin = false;
      userWhere.is_zone_admin = false;
      userWhere.is_region_admin = false;
      userWhere.is_all_region_admin = false;
    }

    // Search filter
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    let rosters;
    if (mehfilDirectoryId) {
      // Single mehfil view - show rosters with assignments
      rosters = await dutyRosterModel.findAll({
        where: whereClause,
        include: [
          {
            model: userModel,
            as: "user",
            where: userWhere,
            required: true,
          },
          {
            model: dutyRosterAssignmentModel,
            as: "assignments",
            include: [
              {
                model: dutyTypeModel,
                as: "dutyType",
              },
            ],
            required: false,
          },
        ],
        order: [["id", "ASC"]],
      });

      // Format rosters with assignments grouped by day
      const formattedRosters = rosters.map((roster) => {
        const consolidatedRoster = {
          roster_id: roster.id,
          mehfil_directory_id: roster.mehfil_directory_id,
          user_id: roster.user.id,
          user: roster.user,
          duties: {},
        };

        DAYS.forEach((day) => {
          const dayAssignments = roster.assignments
            ? roster.assignments.filter((a) => a.day === day)
            : [];
          consolidatedRoster.duties[day] = dayAssignments.map((assignment) => ({
            id: assignment.id,
            duty_type_id: assignment.duty_type_id,
            duty_type: assignment.dutyType,
          }));
        });

        return consolidatedRoster;
      });

      return {
        success: true,
        showTable: true,
        data: formattedRosters,
      };
    } else {
      // Zone-wide view - consolidate by user
      rosters = await dutyRosterModel.findAll({
        where: whereClause,
        include: [
          {
            model: userModel,
            as: "user",
            where: userWhere,
            required: true,
          },
          {
            model: mehfilDirectoryModel,
            as: "mehfilDirectory",
            required: false,
          },
          {
            model: dutyRosterAssignmentModel,
            as: "assignments",
            include: [
              {
                model: dutyTypeModel,
                as: "dutyType",
              },
            ],
            required: true, // Only show users with assignments
          },
        ],
        order: [["id", "ASC"]],
      });

      // Group by user_id and consolidate
      const userRostersMap = new Map();

      rosters.forEach((roster) => {
        const userId = roster.user_id;
        if (!userRostersMap.has(userId)) {
          userRostersMap.set(userId, {
            user_id: userId,
            user: roster.user,
            duties: {},
          });
        }

        const consolidatedRoster = userRostersMap.get(userId);

        DAYS.forEach((day) => {
          const dayAssignments = roster.assignments
            ? roster.assignments.filter((a) => a.day === day)
            : [];
          dayAssignments.forEach((assignment) => {
            if (!consolidatedRoster.duties[day]) {
              consolidatedRoster.duties[day] = [];
            }
            consolidatedRoster.duties[day].push({
              id: assignment.id,
              duty_type_id: assignment.duty_type_id,
              duty_type: assignment.dutyType,
              mehfil: roster.mehfilDirectory,
            });
          });
        });
      });

      return {
        success: true,
        showTable: true,
        data: Array.from(userRostersMap.values()),
      };
    }
  } catch (error) {
    logger.error(`Error fetching duty rosters: ${error.message}`);
    throw error;
  }
};

/**
 * Get a single duty roster by ID
 */
exports.getDutyRosterById = async (id) => {
  try {
    const dutyRoster = await dutyRosterModel.findByPk(id, {
      include: [
        {
          model: userModel,
          as: "user",
        },
        {
          model: dutyRosterAssignmentModel,
          as: "assignments",
          include: [
            {
              model: dutyTypeModel,
              as: "dutyType",
            },
          ],
        },
      ],
    });
    if (!dutyRoster) {
      throw new Error("Duty roster not found");
    }
    return dutyRoster;
  } catch (error) {
    logger.error(`Error fetching duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new duty roster (add karkun to roster)
 */
exports.createDutyRoster = async (data) => {
  try {
    const { user_id, zone_id, mehfil_directory_id, created_by } = data;

    if (!mehfil_directory_id) {
      throw new Error("Please select a mehfil first.");
    }

    // Check if roster already exists
    const existing = await dutyRosterModel.findOne({
      where: {
        user_id,
        mehfil_directory_id,
      },
    });

    if (existing) {
      throw new Error("Karkun is already in the roster.");
    }

    const dutyRoster = await dutyRosterModel.create({
      user_id,
      zone_id,
      mehfil_directory_id,
      created_by,
      created_at: new Date(),
    });

    return dutyRoster;
  } catch (error) {
    logger.error(`Error creating duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Update a duty roster
 */
exports.updateDutyRoster = async (id, data) => {
  try {
    const dutyRoster = await dutyRosterModel.findByPk(id);
    if (!dutyRoster) {
      throw new Error("Duty roster not found");
    }

    await dutyRoster.update({
      ...data,
      updated_at: new Date(),
    });

    return dutyRoster;
  } catch (error) {
    logger.error(`Error updating duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a duty roster (remove all duties for a karkun)
 */
exports.deleteDutyRoster = async (id) => {
  try {
    const dutyRoster = await dutyRosterModel.findByPk(id);
    if (!dutyRoster) {
      throw new Error("Duty roster not found");
    }

    await dutyRoster.destroy(); // This will cascade delete assignments
    return { success: true, message: "Duty roster deleted successfully" };
  } catch (error) {
    logger.error(`Error deleting duty roster: ${error.message}`);
    throw error;
  }
};

/**
 * Get duty roster by user (karkun)
 */
exports.getDutyRosterByKarkun = async (userId) => {
  try {
    const dutyRosters = await dutyRosterModel.findAll({
      where: { user_id: userId },
      include: [
        {
          model: dutyRosterAssignmentModel,
          as: "assignments",
          include: [
            {
              model: dutyTypeModel,
              as: "dutyType",
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return dutyRosters;
  } catch (error) {
    logger.error(`Error fetching duty roster by user: ${error.message}`);
    throw error;
  }
};
