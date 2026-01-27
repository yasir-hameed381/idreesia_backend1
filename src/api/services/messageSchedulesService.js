const logger = require("../../config/logger");
const { sequelize: db } = require("../../config/database");
const messageSchedulesModel = require("../models/messageSchedules")(db);
const messagesModel = require("../models/messages")(db);
const usersModel = require("../models/user-admin")(db);

// Initialize associations if not already set up
let associationsInitialized = false;

const initializeAssociations = () => {
  if (associationsInitialized) {
    return;
  }

  // Set up belongsTo relationship with message
  if (!messageSchedulesModel.associations?.message) {
    messageSchedulesModel.belongsTo(messagesModel, {
      foreignKey: "message_id",
      as: "message",
      onDelete: "CASCADE",
    });
  }

  // Set up belongsTo relationship with createdBy user
  if (!messageSchedulesModel.associations?.createdBy) {
    messageSchedulesModel.belongsTo(usersModel, {
      foreignKey: "created_by",
      as: "createdBy",
      onDelete: "SET NULL",
    });
  }

  // Set up belongsTo relationship with updatedBy user
  if (!messageSchedulesModel.associations?.updatedBy) {
    messageSchedulesModel.belongsTo(usersModel, {
      foreignKey: "updated_by",
      as: "updatedBy",
      onDelete: "SET NULL",
    });
  }

  associationsInitialized = true;
};

// Calculate next run time based on repeat type
const calculateNextRunTime = (scheduledAt, repeat, dayFlags) => {
  if (repeat === 'no-repeat') {
    return null;
  }

  const now = new Date();
  let nextRun = new Date(scheduledAt);

  switch (repeat) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      // Find next matching day
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = now.getDay();
      let daysToAdd = 0;
      
      for (let i = 1; i <= 7; i++) {
        const checkDay = (currentDay + i) % 7;
        const dayName = days[checkDay];
        if (dayFlags[dayName]) {
          daysToAdd = i;
          break;
        }
      }
      
      if (daysToAdd === 0) {
        // If no day found in next 7 days, find first day in next week
        for (let i = 0; i < 7; i++) {
          const dayName = days[i];
          if (dayFlags[dayName]) {
            daysToAdd = (i - currentDay + 7) % 7 || 7;
            break;
          }
        }
      }
      
      nextRun.setDate(nextRun.getDate() + daysToAdd);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
    case 'yearly':
      nextRun.setFullYear(nextRun.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return nextRun;
};

exports.createMessageSchedule = async (payload) => {
  try {
    // Verify message exists
    const message = await messagesModel.findByPk(payload.message_id);
    if (!message) {
      throw new Error("Message not found");
    }

    // Combine date and time into scheduled_at
    const scheduledAt = new Date(`${payload.scheduled_date}T${payload.scheduled_time}`);
    
    // Calculate next_run_at
    const dayFlags = {
      monday: payload.monday || false,
      tuesday: payload.tuesday || false,
      wednesday: payload.wednesday || false,
      thursday: payload.thursday || false,
      friday: payload.friday || false,
      saturday: payload.saturday || false,
      sunday: payload.sunday || false,
    };

    const nextRunAt = calculateNextRunTime(
      scheduledAt,
      payload.repeat || 'no-repeat',
      dayFlags
    );

    const scheduleData = {
      message_id: payload.message_id,
      scheduled_at: scheduledAt,
      repeat: payload.repeat || 'no-repeat',
      monday: payload.monday || false,
      tuesday: payload.tuesday || false,
      wednesday: payload.wednesday || false,
      thursday: payload.thursday || false,
      friday: payload.friday || false,
      saturday: payload.saturday || false,
      sunday: payload.sunday || false,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      send_to_mobile_devices: payload.send_to_mobile_devices || false,
      next_run_at: nextRunAt || scheduledAt,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: payload.created_by || null,
      updated_by: payload.updated_by || null,
    };

    const newSchedule = await messageSchedulesModel.create(scheduleData);
    return newSchedule;
  } catch (error) {
    logger.error("Error creating message schedule: " + error.message);
    throw error;
  }
};

exports.getMessageSchedules = async ({ page = 1, size = 25, message_id, requestUrl = "" }) => {
  try {
    initializeAssociations();
    
    const { paginate, constructPagination } = require("../services/utilityServices");
    const { offset, limit, currentPage } = await paginate({ page, size });

    const where = {};
    if (message_id) {
      where.message_id = message_id;
    }

    const { count, rows: data } = await messageSchedulesModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [['next_run_at', 'ASC']],
      include: [
        {
          model: messagesModel,
          as: 'message',
          attributes: ['id', 'title_en', 'title_ur', 'description_en', 'description_ur', 'is_published'],
          required: false,
        },
        {
          model: usersModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
        {
          model: usersModel,
          as: 'updatedBy',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
    });

    const { links, meta } = constructPagination({
      count,
      limit,
      offset,
      currentPage,
      baseUrl: requestUrl,
    });

    return {
      data,
      links,
      meta,
    };
  } catch (error) {
    logger.error("Error fetching message schedules: " + error.message);
    throw error;
  }
};

exports.getMessageScheduleById = async (id) => {
  try {
    initializeAssociations();
    
    const schedule = await messageSchedulesModel.findByPk(id, {
      include: [
        {
          model: messagesModel,
          as: 'message',
          attributes: ['id', 'title_en', 'title_ur', 'description_en', 'description_ur', 'is_published'],
          required: false,
        },
        {
          model: usersModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
        {
          model: usersModel,
          as: 'updatedBy',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
    });

    if (!schedule) {
      throw new Error("Message schedule not found");
    }

    return schedule;
  } catch (error) {
    logger.error("Error fetching message schedule by id: " + error.message);
    throw error;
  }
};

exports.updateMessageSchedule = async (id, payload) => {
  try {
    const schedule = await messageSchedulesModel.findByPk(id);
    if (!schedule) {
      throw new Error("Message schedule not found");
    }

    // Combine date and time into scheduled_at if provided
    let scheduledAt = schedule.scheduled_at;
    if (payload.scheduled_date && payload.scheduled_time) {
      scheduledAt = new Date(`${payload.scheduled_date}T${payload.scheduled_time}`);
    }

    // Calculate next_run_at
    const dayFlags = {
      monday: payload.monday !== undefined ? payload.monday : schedule.monday,
      tuesday: payload.tuesday !== undefined ? payload.tuesday : schedule.tuesday,
      wednesday: payload.wednesday !== undefined ? payload.wednesday : schedule.wednesday,
      thursday: payload.thursday !== undefined ? payload.thursday : schedule.thursday,
      friday: payload.friday !== undefined ? payload.friday : schedule.friday,
      saturday: payload.saturday !== undefined ? payload.saturday : schedule.saturday,
      sunday: payload.sunday !== undefined ? payload.sunday : schedule.sunday,
    };

    const repeat = payload.repeat !== undefined ? payload.repeat : schedule.repeat;
    const nextRunAt = calculateNextRunTime(scheduledAt, repeat, dayFlags);

    const updateData = {
      scheduled_at: scheduledAt,
      repeat: repeat,
      monday: dayFlags.monday,
      tuesday: dayFlags.tuesday,
      wednesday: dayFlags.wednesday,
      thursday: dayFlags.thursday,
      friday: dayFlags.friday,
      saturday: dayFlags.saturday,
      sunday: dayFlags.sunday,
      is_active: payload.is_active !== undefined ? payload.is_active : schedule.is_active,
      send_to_mobile_devices: payload.send_to_mobile_devices !== undefined ? payload.send_to_mobile_devices : schedule.send_to_mobile_devices,
      next_run_at: nextRunAt || scheduledAt,
      updated_at: new Date(),
      updated_by: payload.updated_by || null,
    };

    await schedule.update(updateData);
    return schedule;
  } catch (error) {
    logger.error("Error updating message schedule: " + error.message);
    throw error;
  }
};

exports.deleteMessageSchedule = async (id) => {
  try {
    const deletedRows = await messageSchedulesModel.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Message schedule not found");
    }

    return { message: "Message schedule deleted successfully" };
  } catch (error) {
    logger.error("Error deleting message schedule: " + error.message);
    throw error;
  }
};
