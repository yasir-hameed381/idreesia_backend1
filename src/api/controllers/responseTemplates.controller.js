const httpStatus = require("http-status");
const responseTemplatesService = require("../services/responseTemplatesService");
const logger = require("../../config/logger");

const buildRequestUrl = (req) => {
  if (!req) return "";
  return `${req.protocol}://${req.get("host")}${req.baseUrl}`;
};

exports.getResponseTemplates = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 25,
      search = "",
      sortField = "created_at",
      sortDirection = "desc",
    } = req.query;

    const response = await responseTemplatesService.getResponseTemplates({
      page: Number(page) || 1,
      size: Number(size) || 25,
      search,
      sortField,
      sortDirection,
      requestUrl: buildRequestUrl(req),
    });

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    logger.error(`Error in getResponseTemplates controller: ${error.message}`);
    return next(error);
  }
};

exports.getResponseTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await responseTemplatesService.getResponseTemplateById(id);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    logger.error(`Error in getResponseTemplateById controller: ${error.message}`);
    return next(error);
  }
};

exports.createResponseTemplate = async (req, res, next) => {
  try {
    const response = await responseTemplatesService.createResponseTemplate(req.body);
    return res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    logger.error(`Error in createResponseTemplate controller: ${error.message}`);
    return next(error);
  }
};

exports.updateResponseTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await responseTemplatesService.updateResponseTemplate(id, req.body);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    logger.error(`Error in updateResponseTemplate controller: ${error.message}`);
    return next(error);
  }
};

exports.deleteResponseTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await responseTemplatesService.deleteResponseTemplate(id);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    logger.error(`Error in deleteResponseTemplate controller: ${error.message}`);
    return next(error);
  }
};

