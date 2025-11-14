const httpStatus = require("http-status");
const khatService = require("../services/khatService");

const buildRequestUrl = (req) => {
  if (!req) return "";
  return `${req.protocol}://${req.get("host")}${req.baseUrl}`;
};

exports.getKhats = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 25,
      search = "",
      zone_id,
      mehfil_directory_id,
      status,
      type,
      sortField,
      sortDirection,
    } = req.query;

    const response = await khatService.getKhats({
      page: Number(page) || 1,
      size: Number(size) || 25,
      search,
      zone_id: zone_id ? Number(zone_id) : undefined,
      mehfil_directory_id: mehfil_directory_id
        ? Number(mehfil_directory_id)
        : undefined,
      status,
      type,
      sortField,
      sortDirection,
      requestUrl: buildRequestUrl(req),
    });

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.getKhatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await khatService.getKhatById(id);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.createKhat = async (req, res, next) => {
  try {
    const response = await khatService.createKhat(req.body);
    return res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.updateKhat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await khatService.updateKhat(id, req.body);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.updateKhatStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const response = await khatService.updateKhatStatus(id, status);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};

exports.deleteKhat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await khatService.deleteKhat(id);

    if (!response.success) {
      return res.status(httpStatus.NOT_FOUND).json(response);
    }

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    return next(error);
  }
};


