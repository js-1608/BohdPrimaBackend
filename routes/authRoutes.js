// routes/authRoutes.js
import express from "express";
import { createUser, login } from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, authorizeRoles("admin"), createUser);

export default router;