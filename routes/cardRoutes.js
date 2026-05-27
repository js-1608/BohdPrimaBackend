import express from "express";
import {
  createBusinessCard,
  getBusinessCards,
  getBusinessCardBySlug,
  updateBusinessCard,
  deleteBusinessCard,
  uploadCardImage,
} from "../controllers/cardController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/cardUploadMiddleware.js";

const router = express.Router();

// Public route to view a card by slug
router.get("/public/:slug", getBusinessCardBySlug);

// Admin authenticated routes
router.use(protect);
router.get("/admin/all", getBusinessCards);
router.post("/", createBusinessCard);
router.put("/:id", updateBusinessCard);
router.delete("/:id", deleteBusinessCard);
router.post("/upload-image", upload.single("image"), uploadCardImage);

export default router;
