export const USER_ROLES = ["admin", "collaborator", "content-editor", "lead-manager"];

const PERMISSIONS_BY_ROLE = {
  admin: ["blogs", "leads"],
  collaborator: ["blogs", "leads"],
  "content-editor": ["blogs"],
  "lead-manager": ["leads"],
};

export const getPermissionsForRole = (role) => PERMISSIONS_BY_ROLE[role] || [];

export const sanitizeRole = (role) => {
  if (typeof role !== "string") {
    return "";
  }

  return role.trim().toLowerCase();
};

export const isValidRole = (role) => USER_ROLES.includes(sanitizeRole(role));

export const canAccessScope = (role, scope) => getPermissionsForRole(role).includes(scope);