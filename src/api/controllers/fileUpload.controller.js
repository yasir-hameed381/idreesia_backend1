const logger = require("../../config/logger");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Configure AWS S3 (using DigitalOcean Spaces or S3-compatible storage)
const getS3Client = () => {
  return new AWS.S3({
    endpoint: process.env.SPACES_ENDPOINT || process.env.S3_ENDPOINT,
    accessKeyId: process.env.SPACES_KEY || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET || process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.SPACES_REGION || process.env.AWS_REGION || "us-east-1",
    s3ForcePathStyle: false,
    signatureVersion: "v4",
  });
};

// Create multipart upload
exports.createMultipartUpload = async (req, res, next) => {
  try {
    const { filename, contentType, directory = "uploads", private: isPrivate = false } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({
        success: false,
        message: "Filename and contentType are required",
      });
    }

    const s3 = getS3Client();
    const bucket = process.env.SPACES_BUCKET || process.env.S3_BUCKET;

    // Generate unique filename
    const fileExtension = path.extname(filename);
    const filenameWithoutExt = path.basename(filename, fileExtension);
    const slugifiedName = filenameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const uploadFileName = `${slugifiedName}-${uniqueId}${fileExtension}`;
    const key = `${directory}/${uploadFileName}`;

    // Create multipart upload
    const uploadParams = {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: isPrivate ? "private" : "public-read",
    };

    const result = await s3.createMultipartUpload(uploadParams).promise();

    // Generate presigned URL for direct upload
    const presignedUrl = s3.getSignedUrl("putObject", {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Expires: 3600, // 1 hour
    });

    return res.json({
      success: true,
      message: "Upload created successfully",
      data: {
        uploadName: uploadFileName,
        uploadId: result.UploadId,
        key: result.Key,
        url: presignedUrl,
      },
    });
  } catch (error) {
    logger.error("Error creating multipart upload:", error);
    return next(error);
  }
};

// Sign part for multipart upload
exports.signPart = async (req, res, next) => {
  try {
    const { uploadId, key, partNumber } = req.body;

    if (!uploadId || !key || !partNumber) {
      return res.status(400).json({
        success: false,
        message: "uploadId, key, and partNumber are required",
      });
    }

    const s3 = getS3Client();
    const bucket = process.env.SPACES_BUCKET || process.env.S3_BUCKET;

    const signedUrl = s3.getSignedUrl("uploadPart", {
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Expires: 3600,
    });

    return res.json({
      success: true,
      message: "Part signed successfully",
      data: {
        url: signedUrl,
      },
    });
  } catch (error) {
    logger.error("Error signing part:", error);
    return next(error);
  }
};

// List parts for multipart upload
exports.listParts = async (req, res, next) => {
  try {
    const { uploadId, key } = req.body;

    if (!uploadId || !key) {
      return res.status(400).json({
        success: false,
        message: "uploadId and key are required",
      });
    }

    const s3 = getS3Client();
    const bucket = process.env.SPACES_BUCKET || process.env.S3_BUCKET;

    const result = await s3
      .listParts({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      })
      .promise();

    return res.json({
      success: true,
      message: "Parts listed successfully",
      data: {
        parts: result.Parts || [],
      },
    });
  } catch (error) {
    logger.error("Error listing parts:", error);
    return next(error);
  }
};

// Complete multipart upload
exports.completeMultipartUpload = async (req, res, next) => {
  try {
    const { uploadId, key, parts } = req.body;

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      return res.status(400).json({
        success: false,
        message: "uploadId, key, and parts array are required",
      });
    }

    const s3 = getS3Client();
    const bucket = process.env.SPACES_BUCKET || process.env.S3_BUCKET;

    const result = await s3
      .completeMultipartUpload({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      })
      .promise();

    // Generate public URL
    const publicUrl = result.Location || `https://${bucket}.${process.env.SPACES_REGION || "nyc3"}.digitaloceanspaces.com/${key}`;

    return res.json({
      success: true,
      message: "Upload completed successfully",
      data: {
        location: result.Location,
        url: publicUrl,
        key: key,
      },
    });
  } catch (error) {
    logger.error("Error completing multipart upload:", error);
    return next(error);
  }
};

// Abort multipart upload
exports.abortMultipartUpload = async (req, res, next) => {
  try {
    const { uploadId, key } = req.body;

    if (!uploadId || !key) {
      return res.status(400).json({
        success: false,
        message: "uploadId and key are required",
      });
    }

    const s3 = getS3Client();
    const bucket = process.env.SPACES_BUCKET || process.env.S3_BUCKET;

    await s3
      .abortMultipartUpload({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      })
      .promise();

    return res.json({
      success: true,
      message: "Multipart upload aborted successfully",
    });
  } catch (error) {
    logger.error("Error aborting multipart upload:", error);
    return next(error);
  }
};

// Simple file upload (for smaller files)
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { directory = "files" } = req.body;
    const file = req.file;
    const s3 = getS3Client();
    const bucket = process.env.SPACES_BUCKET || process.env.S3_BUCKET;

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filenameWithoutExt = path.basename(file.originalname, fileExtension);
    const slugifiedName = filenameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const uploadFileName = `${slugifiedName}-${uniqueId}${fileExtension}`;
    const key = `${directory}/${uploadFileName}`;

    // Upload to S3
    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    const result = await s3.upload(uploadParams).promise();

    // Generate public URL
    const publicUrl = result.Location || `https://${bucket}.${process.env.SPACES_REGION || "nyc3"}.digitaloceanspaces.com/${key}`;

    return res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        uploadName: uploadFileName,
        path: key,
        key: key,
        url: publicUrl,
        uploadURL: publicUrl,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
  } catch (error) {
    logger.error("Error uploading file:", error);
    return next(error);
  }
};

