import express from 'express';
import { parseResume, getStats, cleanupAllTempFiles, analyseResumeForOutreach } from '../controllers/resumeParserController.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import responseHandler from '../utils/responseUtils.js';

const router = express.Router();

// ===============================
// API INFORMATION ENDPOINT
// ===============================

router.get('/', (req, res) => {
  res.json({
    message: 'Resume Parser API',
    version: '1.0.0',
    description: 'Extract structured data from PDF resumes',
    endpoints: {
      'POST /api/parse-resume': 'Parse a PDF resume and extract data',
      'GET /api/stats': 'Get parser statistics and capabilities',
      'DELETE /api/cleanup': 'Clean up temporary files',
      'GET /api/health': 'Health check'
    },
    features: [
      'PDF text extraction',
      'Contact information parsing',
      'Skills detection',
      'Experience extraction',
      'Education parsing'
    ],
    limits: {
      maxFileSize: '10MB',
      allowedTypes: ['application/pdf'],
      temporaryStorage: true
    }
  });
});

// ===============================
// RESUME PARSING ROUTES
// ===============================

router.post('/api/parse-resume', 
  upload.single('resume'), 
  handleUploadError,
  parseResume,
  responseHandler
);

// ===============================
// UTILITY ROUTES
// ===============================

router.get('/api/stats', getStats);
router.delete('/api/cleanup', cleanupAllTempFiles);

router.post('/api/analyseResumeForOutreach', analyseResumeForOutreach, responseHandler);

// ===============================
// HEALTH CHECK ENDPOINT
// ===============================

router.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Resume Parser API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      pdfParsing: true,
      textExtraction: true,
      dataStructuring: true,
      temporaryStorage: true
    }
  });
});

export default router;