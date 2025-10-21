const authService = require("../services/authService");
const { ErrorMessages } = require("../Enums/errorMessages");

/**
 * Sign up
 * @param req
 * @param res
 * @returns
 */

exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      message: ErrorMessages.EMAIL_PASSWORD_NAME_REQUIRED,
    });
  }

  try {
    const response = await authService.register(email, password, name);
    return res.status(201).json(response);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || ErrorMessages.REGISTRATION_ERROR,
    });
  }
};

/**
 * Login
 * @param req
 * @param res
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: ErrorMessages.EMAIL_PASSWORD_REQUIRED,
    });
  }

  try {
    const response = await authService.login(email, password);
    return res.status(200).json(response);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || ErrorMessages.LOGIN_ERROR,
    });
  }
};

/**
 * Get current user with permissions
 * @param req
 * @param res
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const user = await authService.getUserWithPermissions(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error fetching user data",
    });
  }
};
