const express = require("express");
const multer = require("multer");
const controller = require("../../controllers/fileUpload.controller");

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Multipart upload routes
router.post("/multipart-upload/create", controller.createMultipartUpload);
router.post("/multipart-upload/sign-part", controller.signPart);
router.post("/multipart-upload/list-parts", controller.listParts);
router.post("/multipart-upload/complete", controller.completeMultipartUpload);
router.post("/multipart-upload/abort", controller.abortMultipartUpload);

// Simple file upload route
router.post("/file-upload", upload.single("file"), controller.uploadFile);

module.exports = router;

