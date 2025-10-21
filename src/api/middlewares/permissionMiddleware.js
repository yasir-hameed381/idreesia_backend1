const permissionMiddleware = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      // Check if user exists in request (from auth middleware)
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required.",
        });
      }

      // If no specific permissions required, allow access
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return next();
      }

      // Check if user has role
      if (!req.user.role) {
        return res.status(403).json({
          message: "Access denied. No role assigned.",
        });
      }

      // Check if user has required permissions
      const userPermissions = req.user.role.permissions || [];
      const userPermissionNames = userPermissions.map((p) => p.name);

      const hasRequiredPermission = requiredPermissions.some((permission) =>
        userPermissionNames.includes(permission)
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };
};

module.exports = permissionMiddleware;
