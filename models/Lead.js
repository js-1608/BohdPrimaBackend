// models/Lead.js
import mongoose from "mongoose";

const leadLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["new", "contacted", "interested", "not-interested"],
    default: "new",
  },
  note: {
    type: String,
    trim: true,
  },
  actedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  actedByName: {
    type: String,
    trim: true,
  },
  actedByRole: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["new", "contacted", "interested", "not-interested"],
    default: "new",
  },
  logs: {
    type: [leadLogSchema],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.model("Lead", leadSchema);