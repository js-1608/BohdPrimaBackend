// models/Admin.js
import mongoose from "mongoose";

import { USER_ROLES } from "../config/permissions.js";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: USER_ROLES,
    default: "admin",
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Admin", adminSchema);