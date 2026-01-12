const { DataTypes } = require("sequelize");

const parseJsonField = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value));
    } catch (error) {
      return value;
    }
  }

  return JSON.stringify(value);
};

const jsonColumn = (fieldName) => ({
  type: DataTypes.TEXT("long"),
  allowNull: true,
  defaultValue: null,
  get() {
    const rawValue = this.getDataValue(fieldName);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue);
    } catch (error) {
      return rawValue;
    }
  },
  set(value) {
    this.setDataValue(fieldName, parseJsonField(value));
  },
});

module.exports = (sequelize) => {
  const Khat = sequelize.define(
    "khats",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      mehfil_directory_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      phone_number: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      father_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      introducer_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ehad_duration: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      last_tarteeb: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      consistent_in_wazaif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      consistent_in_prayers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      consistent_in_ishraq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      makes_up_missed_prayers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      missed_prayers: jsonColumn("missed_prayers"),
      can_read_quran: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      multan_visit_frequency: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mehfil_attendance_frequency: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      is_submitted_before: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_submission_wazaifs: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      kalimah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      allah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      laa_ilaaha_illallah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sallallahu_alayhi_wasallam_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      astagfirullah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ayat_ul_kursi_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dua_e_talluq_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dua_e_waswasey_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      additional_wazaif_reading: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      description: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: null,
      },
      reciter_relation: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      reciter_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      reciter_age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      reciter_ehad_duration: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      reciter_consistent_in_wazaif: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      reciter_consistent_in_prayers: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      reciter_makes_up_missed_prayers: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      reciter_missed_prayers: jsonColumn("reciter_missed_prayers"),
      reciter_can_read_quran: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      reciter_multan_visit_frequency: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      reciter_mehfil_attendance_frequency: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      type: {
        type: DataTypes.ENUM("khat", "masail"),
        allowNull: false,
        defaultValue: "khat",
      },
      status: {
        type: DataTypes.ENUM("pending", "in-review", "awaiting-response", "closed"),
        allowNull: false,
        defaultValue: "pending",
      },
      jawab: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: null,
      },
      jawab_links: jsonColumn("jawab_links"),
      notes: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: null,
      },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      updated_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "khats",
      underscored: true,
      timestamps: true,
    }
  );

  return Khat;
};


