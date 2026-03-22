// routes/blogRoutes.js
import express from "express";
import {
  createBlog,
  uploadBlogImage,
  getAdminBlogs,
  getBlogs,
  getBlog,
  updateBlog,
  publishBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/admin/all", protect, authorizeRoles("admin", "collaborator", "content-editor"), getAdminBlogs);
router.post("/upload-image", protect, authorizeRoles("admin", "collaborator", "content-editor"), upload.single("image"), uploadBlogImage);
router.get("/", getBlogs);
router.get("/:slug", getBlog);
router.post("/", protect, authorizeRoles("admin", "collaborator", "content-editor"), upload.single("image"), createBlog);
router.put("/:id", protect, authorizeRoles("admin", "collaborator", "content-editor"), upload.single("image"), updateBlog);
router.delete("/:id", protect, authorizeRoles("admin", "collaborator", "content-editor"), deleteBlog);
router.patch("/publish/:id", protect, authorizeRoles("admin", "collaborator", "content-editor"), publishBlog);

export default router;