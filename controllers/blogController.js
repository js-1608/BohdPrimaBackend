// controllers/blogController.js
import Blog from "../models/Blog.js";
import slugify from "slugify";

const normalizeImagePath = (filePath) =>
  filePath ? filePath.replace(/\\/g, "/").replace(/^\/+/, "") : "";

const getStoredImagePath = (file) => {
  if (!file) {
    return "";
  }

  // Keep DB values portable across environments.
  return normalizeImagePath(`uploads/blogs/${file.filename}`);
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

const toBlogResponse = (req, blogDoc) => {
  const blog = typeof blogDoc.toObject === "function" ? blogDoc.toObject() : blogDoc;
  return {
    ...blog,
    imageUrl: toPublicImageUrl(req, blog.image),
  };
};

const parseEditorContent = (rawContent) => {
  if (rawContent === undefined || rawContent === null) {
    return rawContent;
  }

  if (typeof rawContent !== "string") {
    return rawContent;
  }

  const trimmed = rawContent.trim();
  if (!trimmed) {
    return "";
  }

  const firstChar = trimmed[0];
  const isLikelyJson = firstChar === "{" || firstChar === "[";

  if (!isLikelyJson) {
    return rawContent;
  }

  try {
    return JSON.parse(rawContent);
  } catch {
    return rawContent;
  }
};

const hasValidContent = (value) => {
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
};

const buildSlug = (title) =>
  slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

const getUniqueSlug = async (title, excludeId) => {
  const baseSlug = buildSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (
    await Blog.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, content, image, status } = req.body;
    const parsedContent = parseEditorContent(content);

    if (!title || !hasValidContent(parsedContent)) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const blog = new Blog({
      title,
      content: parsedContent,
      slug: await getUniqueSlug(title),
      image: getStoredImagePath(req.file) || image,
      status,
      authorName: req.user.name,
      authorId: req.user.id,
      authorRole: req.user.role,
    });

    await blog.save();
    res.status(201).json(toBlogResponse(req, blog));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Blogs (Published only for frontend)
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs.map((blog) => toBlogResponse(req, blog)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Blogs For Admin
export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ updatedAt: -1, createdAt: -1 });
    res.json(blogs.map((blog) => toBlogResponse(req, blog)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog || blog.status !== "published") {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(toBlogResponse(req, blog));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const updateData = { ...req.body };

    delete updateData.authorName;
    delete updateData.authorId;
    delete updateData.authorRole;

    if (Object.prototype.hasOwnProperty.call(updateData, "content")) {
      updateData.content = parseEditorContent(updateData.content);

      if (!hasValidContent(updateData.content)) {
        return res.status(400).json({ message: "Content cannot be empty" });
      }
    }

    if (updateData.title) {
      updateData.slug = await getUniqueSlug(updateData.title, req.params.id);
    }

    if (req.file) {
      updateData.image = getStoredImagePath(req.file);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(toBlogResponse(req, blog));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publish Blog
export const publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: "published" },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(toBlogResponse(req, blog));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload single image for blog content editor
export const uploadBlogImage = async (req, res) => {
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