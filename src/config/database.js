const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // 👈 Force include for Vercel bundler
const logger = require('./logger');
const { mysqlConfig } = require('./vars');
 
/**
* Connect to mysql db
*
* @returns {object} mysql connection
* @public
*/
const sequelize = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.user,
  mysqlConfig.password,
  {
    host: mysqlConfig.host,
    dialect: 'mysql',
    pool: {
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);
 
// Only check connection in non-serverless environments
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  async function checkConnection() {
    try {
      await sequelize.authenticate();
      logger.info('Connection to the database has been established successfully.');
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
    }
  }
  checkConnection();
}
 
module.exports.sequelize = sequelize;