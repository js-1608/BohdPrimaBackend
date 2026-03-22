// controllers/leadController.js
import Lead from "../models/Lead.js";

const LEAD_STATUS = ["new", "contacted", "interested", "not-interested"];

const sanitizeLeadStatus = (status) => {
  if (typeof status !== "string") {
    return "";
  }

  return status.trim().toLowerCase().replace(/\s+/g, "-");
};

// Create Lead (Public API)
export const createLead = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    const lead = new Lead({
      ...req.body,
      logs: [{
        action: "Lead created",
        status: "new",
        note: "Lead submitted from website form",
      }],
    });
    await lead.save();
    res.status(201).json({
      message: "Lead captured successfully",
      lead,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Leads (Admin)
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const normalizedStatus = sanitizeLeadStatus(req.body.status);
    const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

    if (!LEAD_STATUS.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.status = normalizedStatus;
    lead.logs.push({
      action: `Lead marked as ${normalizedStatus}`,
      status: normalizedStatus,
      note,
      actedById: req.user.id,
      actedByName: req.user.name,
      actedByRole: req.user.role,
    });

    await lead.save();

    res.json({
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};