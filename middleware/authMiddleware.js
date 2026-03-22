// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { getPermissionsForRole } from "../config/permissions.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("name email role");

    if (!admin) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const role = admin.role || "admin";
    const name = admin.name || admin.email?.split("@")[0] || "Admin";

    req.user = {
      id: admin._id.toString(),
      name,
      email: admin.email,
      role,
      permissions: getPermissionsForRole(role),
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have access to this resource" });
  }

  next();
};