const {sequelize: db} = require('../../config/database')
const logger = require('../../config/logger');
const { SearchFields } = require('../Enums/searchEnums');
const { common } = require('../Enums/commonEnums');
const { taleem } = require('../models/mehfils');
const { Op } = require('sequelize');


exports.search = async ({ type = '', query = '' }) => {
  try {
    const modelFiles = [common.TALEEM, common.MEHFILS, common.NAAT];
    const models = modelFiles.reduce((acc, model) => {
      acc[model] = require(`../models/${model}`)(db);
      return acc;
    }, {});

    const searchFields = {
      taleem: [
        SearchFields.TITLE_EN,
        SearchFields.TITLE_UR,
        SearchFields.DESCRIPTION,
        SearchFields.FILENAME,
        SearchFields.TRACK,
      ],
      wazaif: [
        SearchFields.TITLE_EN,
        SearchFields.TITLE_UR,
        SearchFields.DESCRIPTION,
        SearchFields.SLUG,
      ],
      naat: [
        SearchFields.TITLE_EN,
        SearchFields.TITLE_UR,
        SearchFields.FILENAME,
        SearchFields.FILEPATH,
        SearchFields.TRACK,
      ],
    };

    const targetModel = models[type];
    if (!targetModel) {
      throw new Error(`type is required like 'taleem', 'mehfils', 'naat'`);
    }
    if (!query) {
      throw new Error(`No results found, please try with different keywords`);
    }

    const fieldsToSearch = searchFields[type];
    const where = query && fieldsToSearch ? {
      [Op.or]: fieldsToSearch.map((field) => ({
        [field]: { [Op.like]: `%${query}%` },
      })),
    } : {};

    const data = await targetModel.findAll({ where });

    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error(`Error fetching data for type ${type}: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};
