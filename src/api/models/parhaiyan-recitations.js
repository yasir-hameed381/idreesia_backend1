const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const Parhaiyan_recitaions = sequelize.define('parhaiyan_recitations', {
//     id: {
//       type: DataTypes.BIGINT.UNSIGNED,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     parhaiyan_id: {
//       type: DataTypes.BIGINT.UNSIGNED,
//       allowNull: false,
//     },
//     darood_ibrahimi: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     qul_shareef: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     yaseen_shareef: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     quran_pak: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     name: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//       unique: false,
//     },
//     father_name: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     city: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     mobile_number: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     created_at: {
//       type: DataTypes.TIMESTAMP,
//       allowNull: true,
//       defaultValue: Sequelize.NOW,
//     },
//     updated_at: {
//       type: DataTypes.TIMESTAMP,
//       allowNull: true,
//       defaultValue: Sequelize.NOW,
//     },
//     ip_address: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },
//     user_agent: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },
//     browser: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },
//     device: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },
//     operating_system: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },
//     referrer: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },
//   }, {
//     tableName: 'parhaiyan_recitations',
//     timestamps: false, // since you have custom timestamps
//     underscored: true,
//   });

//   return Parhaiyan_recitaions;
// };

module.exports = (sequelize) => {
  const parhaiyan_Recitations = sequelize.define('parhaiyan_recitations', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    parhaiyan_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    darood_ibrahimi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    qul_shareef: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    yaseen_shareef: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quran_pak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: false,
    },
    father_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mobile_number: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    browser: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    device: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    operating_system: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    referrer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'parhaiyan_recitations',
    timestamps: false, // since you have custom timestamps
    underscored: true,
  });

  return parhaiyan_Recitations;
};









