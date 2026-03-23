// controllers/authController.js
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPermissionsForRole, isValidRole, sanitizeRole } from "../config/permissions.js";

const buildAuthPayload = (admin) => {
  const role = admin.role || "admin";
  const name = admin.name || admin.email?.split("@")[0] || "Admin";

  return {
    id: admin._id,
    name,
    email: admin.email,
    role,
    permissions: getPermissionsForRole(role),
  };
};

const generateToken = (admin) =>
  jwt.sign(buildAuthPayload(admin), process.env.JWT_SECRET, { expiresIn: "7d" });

// Create user (admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole = sanitizeRole(role || "admin");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!isValidRole(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    await admin.save();

    res.status(201).json({
      message: "User created",
      admin: buildAuthPayload(admin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: generateToken(admin),
      admin: buildAuthPayload(admin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await Admin.find().select("-password");
    res.json({
      users: users.map(buildAuthPayload),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset user password (admin only)
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password reset successfully",
      user: buildAuthPayload(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Admin.findByIdAndDelete(id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};