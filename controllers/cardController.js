// controllers/cardController.js
import BusinessCard from "../models/BusinessCard.js";
import slugify from "slugify";

const normalizeImagePath = (filePath) =>
  filePath ? filePath.replace(/\\/g, "/").replace(/^\/+/, "") : "";

const getStoredImagePath = (file) => {
  if (!file) {
    return "";
  }
  return normalizeImagePath(`uploads/cards/${file.filename}`);
};

const getBaseUrl = (req) => {
  const configuredBaseUrl = process.env.PUBLIC_BASE_URL || process.env.SERVER_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  const forwardedProtoHeader = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProtoHeader === "string" && forwardedProtoHeader.length > 0
      ? forwardedProtoHeader.split(",")[0].trim()
      : req.protocol;

  return `${protocol}://${req.get("host")}`;
};

const toPublicImageUrl = (req, imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = normalizeImagePath(imagePath);
  return `${getBaseUrl(req)}/${normalizedPath}`;
};

const toCardResponse = (req, cardDoc) => {
  const card = typeof cardDoc.toObject === "function" ? cardDoc.toObject() : cardDoc;
  return {
    ...card,
    avatarUrl: toPublicImageUrl(req, card.avatar),
    logoUrl: toPublicImageUrl(req, card.logo),
  };
};

const buildSlug = (name) =>
  slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

const getUniqueSlug = async (name, excludeId) => {
  const baseSlug = buildSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (
    await BusinessCard.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

// Create Business Card
export const createBusinessCard = async (req, res) => {
  try {
    const {
      name,
      title,
      company,
      email,
      phone,
      website,
      address,
      bio,
      avatar,
      logo,
      socialLinks,
      theme,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const card = new BusinessCard({
      name,
      title: title || "",
      company: company || "",
      email: email || "",
      phone: phone || "",
      website: website || "",
      address: address || "",
      bio: bio || "",
      avatar: avatar || "",
      logo: logo || "",
      socialLinks: socialLinks || {
        linkedin: "",
        twitter: "",
        github: "",
        facebook: "",
        instagram: "",
      },
      slug: await getUniqueSlug(name),
      theme: theme || "modern-dark",
      createdBy: req.user.id,
    });

    await card.save();
    res.status(201).json(toCardResponse(req, card));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Business Cards (Admin Dashboard)
export const getBusinessCards = async (req, res) => {
  try {
    const cards = await BusinessCard.find().sort({ updatedAt: -1, createdAt: -1 });
    res.json(cards.map((card) => toCardResponse(req, card)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Business Card by Slug (Public View)
export const getBusinessCardBySlug = async (req, res) => {
  try {
    const card = await BusinessCard.findOne({ slug: req.params.slug });

    if (!card) {
      return res.status(404).json({ message: "Business card not found" });
    }

    res.json(toCardResponse(req, card));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Business Card
export const updateBusinessCard = async (req, res) => {
  try {
    const updateData = { ...req.body };

    delete updateData.createdBy;

    if (updateData.name) {
      updateData.slug = await getUniqueSlug(updateData.name, req.params.id);
    }

    const card = await BusinessCard.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!card) {
      return res.status(404).json({ message: "Business card not found" });
    }

    res.json(toCardResponse(req, card));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Business Card
export const deleteBusinessCard = async (req, res) => {
  try {
    const card = await BusinessCard.findByIdAndDelete(req.params.id);

    if (!card) {
      return res.status(404).json({ message: "Business card not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload card image (Avatar or Logo)
export const uploadCardImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const relativePath = getStoredImagePath(req.file);
    const imageUrl = toPublicImageUrl(req, relativePath);

    res.status(201).json({
      message: "Image uploaded",
      image: relativePath,
      url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
