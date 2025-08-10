  import fs from 'fs';
  import path, { join } from 'path';
  import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
  import { config } from '../config/server.js';
  import { dirname } from 'path';
  import { fileURLToPath } from 'url';
  import { 
    formatFileSize, 
    cleanupTempFile, 
    extractResumeData,
    generateOutreachMessage
  } from '../utils/resumeUtils.js';

  // Configure PDF.js worker path
  // pdfjs.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  pdfjs.GlobalWorkerOptions.workerSrc = join(
    __dirname,
    '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
  );
  // ===============================
  // PDF PARSING HELPER FUNCTION
  // ===============================

  const parsePDFWithPDFJS = async (buffer) => {
    try {
      // Load the PDF document
      const uint8Array = Uint8Array.from(buffer);
      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        standardFontDataUrl: join(__dirname, '../node_modules/pdfjs-dist/standard_fonts/'),
      });
      
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      
      let fullText = '';
      
      // Extract text from each page
      let allLinks = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
      
        // Combine text items into a single string
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n\n';

        // 🔍 Extract links
    const annotations = await page.getAnnotations({ intent: 'display' });
    const pageLinks = annotations
      .filter(a => a.subtype === 'Link' && a.url)
      .map(a => a.url);

    allLinks = allLinks.concat(pageLinks);
      }
      
      // Get document info
      const info = await pdfDocument.getMetadata();
      
      return {
        text: fullText.trim(),
        numPages: numPages,
        info: info.info || {},
        links: allLinks
      };
      
    } catch (error) {
      console.error('PDF.js parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  };

  // ===============================
  // MAIN CONTROLLER FUNCTIONS
  // ===============================

  export const parseResume = async (req, res,next) => {
    let tempFilePath = null;
    
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No PDF file uploaded',
          message: 'Please select a PDF resume to parse'
        });
      }

      tempFilePath = req.file.path;
      
      // Read the PDF file buffer
      const pdfBuffer = fs.readFileSync(tempFilePath);
      
      // Parse PDF and extract text using PDF.js
      const pdfData = await parsePDFWithPDFJS(pdfBuffer);
      // Extract useful information
      const extractedData = await extractResumeData(pdfData.text,pdfData.links);
      
      // Prepare response
      const result = {
        success: true,
        message: 'Resume parsed successfully',
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        fileSizeFormatted: formatFileSize(req.file.size),
        parsedAt: new Date().toISOString(),
        // rawText: pdfData.text,
        extractedData: extractedData,
        metadata: {
          totalPages: pdfData.numPages,
          pdfInfo: pdfData.info || {},
          textLength: pdfData.text.length
        }
      };

      req.data = {
        data: result,
        message: 'Resume parsed successfully',
        status: 200
      };
      next();

    } catch (error) {
      console.error('Parse error:', error);
      res.status(500).json({
        error: 'Failed to parse resume',
        message: error.message,
        type: 'parsing_error'
      });
    } finally {
      // Clean up temporary file
      if (tempFilePath && config.cleanupTempFiles) {
        cleanupTempFile(tempFilePath);
      }
    }
  };

  export const getStats = async (req, res) => {
    try {
      const stats = {
        success: true,
        service: 'Resume Parser API',
        version: '1.0.0',
        features: [
          'PDF text extraction',
          'Contact information parsing',
          'Skills detection',
          'Experience extraction',
          'Education parsing',
          'Summary extraction'
        ],
        supportedFormats: ['PDF'],
        maxFileSize: formatFileSize(config.maxFileSize),
        temporaryStorage: true,
        autoCleanup: config.cleanupTempFiles
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        error: 'Failed to get statistics',
        message: error.message
      });
    }
  };

  export const cleanupAllTempFiles = async (req, res) => {
    try {
      if (!fs.existsSync(config.tempDir)) {
        return res.json({
          success: true,
          message: 'No temporary files to clean',
          deletedCount: 0
        });
      }

      const files = fs.readdirSync(config.tempDir);
      let deletedCount = 0;

      for (const filename of files) {
        try {
          const filePath = path.join(config.tempDir, filename);
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting ${filename}:`, error);
        }
      }

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} temporary files`,
        deletedCount
      });

    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      res.status(500).json({
        error: 'Failed to cleanup temporary files',
        message: error.message
      });
    }
  };

  export const analyseResumeForOutreach = async (req, res, next) => {
    try {
      const { extractedData,recruiterName, companyName, role,jobDescription } = req.body;
      const outreachMessage = await generateOutreachMessage(extractedData, recruiterName, companyName, role,jobDescription);
      req.data = {
        data: {
          outreachMessage
        },
        message: 'Outreach message generated successfully',
        status: 200
      }
      next();
    } catch (error) {
      console.error('Error generating outreach message:', error);
      req.data={
        data: error,
        message: 'Error generating outreach message',
        status: 500
      }
      next();
    }
  };
