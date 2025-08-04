import { createServer, config } from './config/server.js';
import resumeRoutes from './routes/fileRoutes.js';

// Create Express application
const app = createServer();

// Register routes
app.use('/', resumeRoutes);

// Start server
const startServer = () => {
  try {
    app.listen(config.port, () => {
      console.log('🚀 Resume Parser API Started');
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Server running on port ${config.port}`);
      console.log(`📁 Temp directory: ${config.tempDir}`);
      console.log(`📦 Max file size: ${Math.round(config.maxFileSize / (1024 * 1024))}MB`);
      console.log(`🧹 Auto cleanup: ${config.cleanupTempFiles ? 'enabled' : 'disabled'}`);
      console.log(`🔗 API available at http://localhost:${config.port}`);
      console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  GET  /                    - API information');
      console.log('  POST /api/parse-resume    - Parse PDF resume');
      console.log('  GET  /api/stats           - Parser statistics');
      console.log('  DELETE /api/cleanup       - Clean temp files');
      console.log('  GET  /api/health          - Health check');
      console.log('');
      console.log('🎯 Ready to parse PDF resumes!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();