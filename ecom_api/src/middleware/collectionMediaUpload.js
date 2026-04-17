"use strict";

const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const BASE_URL =
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantDbName = req.tenant ? req.tenant.dataBaseName : "default";
    const productsDir = path.join(
      PROJECT_ROOT,
      "uploads",
      tenantDbName,
      "products",
    );
    if (!fsSync.existsSync(productsDir)) {
      fsSync.mkdirSync(productsDir, { recursive: true });
    }
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/avif",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const uploadCollectionMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const buildMediaList = (files, tenantDbName) => {
  return files.map((file, index) => {
    const relativePath = `uploads/${tenantDbName}/products/${file.filename}`;
    const type = file.mimetype.startsWith("video") ? "video" : "image";
    return {
      url: `${BASE_URL}/${relativePath}`,
      type,
      position: index + 1,
      localPath: file.path,
    };
  });
};

/**
 * Cleans up uploaded files if the transaction fails.
 */
const cleanupFiles = async (files) => {
  if (!files) return;
  for (const file of files) {
    const filePath = file.localPath || file.path;
    try {
      await fs.unlink(filePath);
    } catch {}
  }
};

/**
 * Express error-handling middleware for multer errors.
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = {
  uploadCollectionMedia,
  buildMediaList,
  cleanupFiles,
  handleMulterError,
};
