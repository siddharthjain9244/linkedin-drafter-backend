import multer from 'multer';
import path from 'path';
import { config } from '../config/server.js';

// Configure multer for temporary PDF file processing
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.tempDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename for temporary processing
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only accept PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  }
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `PDF file must be smaller than ${Math.round(config.maxFileSize / (1024 * 1024))}MB`
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Invalid field name',
        message: 'File must be uploaded with field name "pdf"'
      });
    }
  }

  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only PDF files are allowed'
    });
  }

  next(error);
};