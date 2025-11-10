const { Op } = require("sequelize");
const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const dutyRosterModel = require("../models/dutyRoster")(db);
const dutyRosterAssignmentModel = require("../models/dutyRosterAssignment")(db);
const userModel = require("../models/user-admin")(db);
const dutyTypeModel = require("../models/dutyType")(db);
const mehfilDirectoryModel = require("../models/mehfil-directories")(db);

let associationsInitialized = false;

const initializeAssociations = () => {
  if (associationsInitialized) {
    return;
  }

  if (!dutyRosterModel.associations?.user) {
    dutyRosterModel.belongsTo(userModel, {
      foreignKey: "user_id",
      as: "user",
    });
  }

  if (!dutyRosterModel.associations?.mehfilDirectory) {
    dutyRosterModel.belongsTo(mehfilDirectoryModel, {
      foreignKey: "mehfil_directory_id",
      as: "mehfilDirectory",
    });
  }

  if (!dutyRosterModel.associations?.assignments) {
    dutyRosterModel.hasMany(dutyRosterAssignmentModel, {
      foreignKey: "duty_roster_id",
      as: "assignments",
      onDelete: "CASCADE",
    });
  }

  if (!dutyRosterAssignmentModel.associations?.dutyType) {
    dutyRosterAssignmentModel.belongsTo(dutyTypeModel, {
      foreignKey: "duty_type_id",
      as: "dutyType",
    });
  }

  if (!dutyRosterAssignmentModel.associations?.dutyRoster) {
    dutyRosterAssignmentModel.belongsTo(dutyRosterModel, {
      foreignKey: "duty_roster_id",
      as: "dutyRoster",
      onDelete: "CASCADE",
    });
  }

  associationsInitialized = true;
};

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
 * Get all duty rosters with assignments (no filters - simple implementation)
 */
exports.getAllDutyRosters = async ({
  zoneId = null,
  mehfilDirectoryId = null,
  userTypeFilter = "karkun",
  search = "",
}) => {
  try {
    initializeAssociations();

    // Simple query - get all rosters with user and assignments
    const rosters = await dutyRosterModel.findAll({
      include: [
        {
          model: userModel,
          as: "user",
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
          required: false,
        },
      ],
      order: [["id", "ASC"]],
    });

    // Group by user and consolidate all duties
    const userRostersMap = new Map();

    rosters.forEach((roster) => {
      const userId = roster.user_id;
      if (!userRostersMap.has(userId)) {
        userRostersMap.set(userId, {
          roster_id: roster.id,
          user_id: userId,
          user: roster.user,
          mehfil_directory_id: roster.mehfil_directory_id,
          mehfil_directory: roster.mehfilDirectory,
          duties: {},
        });
      }

      const consolidatedRoster = userRostersMap.get(userId);

      // Initialize all days with empty arrays
      DAYS.forEach((day) => {
        if (!consolidatedRoster.duties[day]) {
          consolidatedRoster.duties[day] = [];
        }
      });

      // Add assignments to respective days
      if (roster.assignments && roster.assignments.length > 0) {
        roster.assignments.forEach((assignment) => {
          if (assignment.day && DAYS.includes(assignment.day)) {
            consolidatedRoster.duties[assignment.day].push({
              id: assignment.id,
              duty_type_id: assignment.duty_type_id,
              duty_type: assignment.dutyType,
              mehfil: roster.mehfilDirectory,
            });
          }
        });
      }
    });

    const data = Array.from(userRostersMap.values());

    return {
      success: true,
      showTable: true,
      data: data,
    };
  } catch (error) {
    logger.error(`Error fetching duty rosters: ${error.message}`, {
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Get a single duty roster by ID
 */
exports.getDutyRosterById = async (id) => {
  try {
    initializeAssociations();
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
    initializeAssociations();
    const { user_id, zone_id, mehfil_directory_id, created_by, duties } = data;

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

    // Create duty assignments if duties are provided
    if (duties && Object.keys(duties).length > 0) {
      const assignmentsToCreate = [];
      
      for (const [day, dutyTypeId] of Object.entries(duties)) {
        if (dutyTypeId) {
          assignmentsToCreate.push({
            duty_roster_id: dutyRoster.id,
            duty_type_id: dutyTypeId,
            day: day,
            created_at: new Date(),
          });
        }
      }

      if (assignmentsToCreate.length > 0) {
        await dutyRosterAssignmentModel.bulkCreate(assignmentsToCreate);
      }
    }

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
    initializeAssociations();
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
    initializeAssociations();
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
    initializeAssociations();
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

/**
 * Fetch karkuns/ehad karkuns that can be added to a roster
 */
exports.getAvailableKarkuns = async ({
  zoneId,
  mehfilDirectoryId = null,
  userTypeFilter = "karkun",
  search = "",
}) => {
  try {
    initializeAssociations();
    if (!zoneId) {
      return [];
    }

    const parsedZoneId = Number(zoneId);
    if (Number.isNaN(parsedZoneId)) {
      throw new Error("Invalid zoneId provided");
    }

    const parsedMehfilIdRaw =
      typeof mehfilDirectoryId !== "undefined" && mehfilDirectoryId !== null
        ? Number(mehfilDirectoryId)
        : null;
    const parsedMehfilId =
      parsedMehfilIdRaw !== null && !Number.isNaN(parsedMehfilIdRaw)
        ? parsedMehfilIdRaw
        : null;

    const whereClause = {
      zone_id: parsedZoneId,
      is_super_admin: false,
    };

    if (userTypeFilter) {
      whereClause.user_type = userTypeFilter;
    }

    if (userTypeFilter === "karkun") {
      if (!parsedMehfilId) {
        // Mirror Laravel behavior: without a mehfil selected, don't return karkuns
        return [];
      }

      whereClause.mehfil_directory_id = parsedMehfilId;
      whereClause.is_mehfil_admin = false;
      whereClause.is_zone_admin = false;
      whereClause.is_region_admin = false;
      whereClause.is_all_region_admin = false;
    } else if (parsedMehfilId) {
      whereClause.mehfil_directory_id = parsedMehfilId;
    }

    const trimmedSearch = search ? search.trim() : "";

    if (trimmedSearch) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${trimmedSearch}%` } },
        { email: { [Op.like]: `%${trimmedSearch}%` } },
        { phone_number: { [Op.like]: `%${trimmedSearch}%` } },
      ];
    }

    const karkuns = await userModel.findAll({
      where: whereClause,
      order: [
        ["name", "ASC"],
        ["id", "ASC"],
      ],
      attributes: [
        "id",
        "name",
        "father_name",
        "email",
        "phone_number",
        "user_type",
        "zone_id",
        "mehfil_directory_id",
        "avatar",
      ],
    });

    return karkuns;
  } catch (error) {
    logger.error(`Error fetching available karkuns: ${error.message}`);
    throw error;
  }
};
