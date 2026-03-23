// routes/authRoutes.js
import express from "express";
import { createUser, login, getAllUsers, resetUserPassword, deleteUser } from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, authorizeRoles("admin"), createUser);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.patch("/users/:id/reset-password", protect, authorizeRoles("admin"), resetUserPassword);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;