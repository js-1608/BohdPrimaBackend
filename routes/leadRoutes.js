// routes/leadRoutes.js
import express from "express";
import { createLead, getLeads, updateLeadStatus } from "../controllers/leadController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", createLead);
router.get("/", protect, authorizeRoles("admin", "collaborator", "lead-manager"), getLeads);
router.patch("/:id/status", protect, authorizeRoles("admin", "collaborator", "lead-manager"), updateLeadStatus);
export default router;