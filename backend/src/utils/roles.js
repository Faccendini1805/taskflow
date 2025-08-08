// Define roles and their permissions
const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  AGENT: 'AGENT'
};

// Permissions for each role
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'tasks:create',
    'tasks:read',
    'tasks:update',
    'tasks:delete',
    'reports:view'
  ],
  [ROLES.SUPERVISOR]: [
    'tasks:create',
    'tasks:read',
    'tasks:update',
    'reports:view'
  ],
  [ROLES.AGENT]: [
    'tasks:read',
    'tasks:update:own'
  ]
};

// Check if a role has a specific permission
const hasPermission = (role, permission) => {
  if (!role || !PERMISSIONS[role]) return false;
  return PERMISSIONS[role].includes(permission);
};

// Middleware to check permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole || !hasPermission(userRole, permission)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para realizar esta acción.'
      });
    }
    
    next();
  };
};

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  checkPermission
};
