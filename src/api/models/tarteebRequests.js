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

module.exports = (sequelize) => {
  const TarteebRequest = sequelize.define(
    "tarteeb_requests",
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
        allowNull: false,
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
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("male", "female"),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      introducer_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ehad_duration: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      source_of_income: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      education: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      marital_status: {
        type: DataTypes.ENUM("single", "married", "divorced", "widowed"),
        allowNull: false,
      },
      consistent_in_wazaif: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      consistent_in_prayers: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      missed_prayers: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: null,
        get() {
          const rawValue = this.getDataValue("missed_prayers");
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
          this.setDataValue("missed_prayers", parseJsonField(value));
        },
      },
      makes_up_missed_prayers: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      nawafil: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      can_read_quran: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      consistent_in_ishraq: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      consistent_in_tahajjud: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      amount_of_durood: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      listens_taleem_daily: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      last_wazaif_tarteeb: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      multan_visit_frequency: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      mehfil_attendance_frequency: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      household_members_in_ehad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      reads_current_wazaif_with_ease: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      able_to_read_additional_wazaif: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      wazaif_consistency_duration: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      does_dum_taweez: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      kalimah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      allah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      laa_ilaaha_illallah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      sallallahu_alayhi_wasallam_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      astagfirullah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      ayat_ul_kursi_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      dua_e_talluq_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      subhanallah_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      dua_e_waswasey_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      other_wazaif: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      wazaif_not_reading: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      additional_wazaif_reading: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      issues_facing: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "pending",
      },
      jawab: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      jawab_links: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: null,
        get() {
          const rawValue = this.getDataValue("jawab_links");
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
          this.setDataValue("jawab_links", parseJsonField(value));
        },
      },
      notes: {
        type: DataTypes.TEXT,
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "tarteeb_requests",
      timestamps: false,
      underscored: true,
    }
  );

  return TarteebRequest;
};

