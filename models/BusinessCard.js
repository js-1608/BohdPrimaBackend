// models/BusinessCard.js
import mongoose from "mongoose";

const businessCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },
    logo: {
      type: String,
      trim: true,
      default: "",
    },
    socialLinks: {
      linkedin: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    theme: {
      type: String,
      default: "modern-dark",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BusinessCard", businessCardSchema);
