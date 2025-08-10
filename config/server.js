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
  
  // CORS configuration
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://linkedin-drafter.onrender.com'  // Replace with your frontend URL
      : true, // Allow all origins in development
    credentials: true, // Allow cookies/auth headers
    optionsSuccessStatus: 200, // For legacy browser support
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  
  app.use(cors(corsOptions));
  
  // Server-side origin validation middleware (blocks non-browser requests)
  app.use((req, res, next) => {
    const origin = req.get('Origin') || req.get('Referer');
    const userAgent = req.get('User-Agent') || '';
    
    // Skip validation for development environment
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    
    // Allow health check endpoint for monitoring services
    if (req.path === '/api/health' || req.path === '/health') {
      return next();
    }
    
    // Block requests without proper origin (like Postman, curl, etc.)
    if (!origin) {
      console.log(`🚫 Blocked request with no origin/referer. User-Agent: ${userAgent}, Path: ${req.path}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Direct API access not allowed. Please use the web application.'
      });
    }
    
    // Additional security: Check for browser-specific headers
    const secFetchSite = req.get('sec-fetch-site');
    const secFetchMode = req.get('sec-fetch-mode');
    
    // These headers are automatically added by browsers and hard to fake in curl
    if (!secFetchSite || !secFetchMode) {
      console.log(`🚫 Blocked request missing browser security headers. User-Agent: ${userAgent}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Invalid request headers'
      });
    }
    
    // Check if it's a legitimate cross-site request from browser
    if (secFetchSite !== 'cross-site' || secFetchMode !== 'cors') {
      console.log(`🚫 Blocked request with invalid fetch headers. Site: ${secFetchSite}, Mode: ${secFetchMode}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Invalid request context'
      });
    }
    
    // Optional: API Key validation (uncomment to enable)
    // const apiKey = req.get('X-API-Key');
    // const validApiKey = process.env.API_KEY || 'your-secret-api-key';
    // if (apiKey !== validApiKey) {
    //   console.log(`🚫 Blocked request with invalid API key`);
    //   return res.status(403).json({
    //     error: 'Access denied',
    //     message: 'Invalid API key'
    //   });
    // }
    
    // Extract origin domain from URL
    let originDomain;
    try {
      originDomain = new URL(origin).origin;
    } catch (e) {
      console.log(`🚫 Blocked request with invalid origin: ${origin}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Invalid origin'
      });
    }
    let allowedOrigins = [
      'https://linkedin-drafter.onrender.com',
    ];
    // Check if origin is allowed
    if (!allowedOrigins.includes(originDomain)) {
      console.log(`🚫 Blocked request from unauthorized origin: ${originDomain}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Unauthorized origin',
        origin: originDomain
      });
    }
    
    next();
  });
  
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
  // app.use('*', (req, res) => {
  //   res.status(404).json({
  //     error: 'Route not found',
  //     message: `Route ${req.originalUrl} not found`
  //   });
  // });

  return app;
};

export const config = {
  port: process.env.PORT || 3000,
  tempDir: path.join(path.dirname(__dirname), 'temp'),
  maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  nodeEnv: process.env.NODE_ENV || 'development',
  cleanupTempFiles: process.env.CLEANUP_TEMP_FILES !== 'false' // default true
};