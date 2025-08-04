import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createServer = () => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Create temporary directory for processing if it doesn't exist
  const tempDir = path.join(path.dirname(__dirname), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Global error handling middleware
  app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      message: `Route ${req.originalUrl} not found`
    });
  });

  return app;
};

export const config = {
  port: process.env.PORT || 3000,
  tempDir: path.join(path.dirname(__dirname), 'temp'),
  maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  nodeEnv: process.env.NODE_ENV || 'development',
  cleanupTempFiles: process.env.CLEANUP_TEMP_FILES !== 'false' // default true
};