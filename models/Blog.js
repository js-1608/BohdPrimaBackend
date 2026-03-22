// models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, required: true, trim: true },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: (value) => {
        if (typeof value === "string") {
          return value.trim().length > 0;
        }

        if (Array.isArray(value)) {
          return value.length > 0;
        }

        if (value && typeof value === "object") {
          return Object.keys(value).length > 0;
        }

        return false;
      },
      message: "Content cannot be empty",
    },
  },
  image: { type: String, trim: true },
  authorName: { type: String, trim: true, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  authorRole: { type: String, trim: true, required: true },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
}, {
  timestamps: true,
});

export default mongoose.model("Blog", blogSchema);