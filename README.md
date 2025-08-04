# Resume Parser API

A Node.js API for parsing PDF resumes and extracting structured data like contact information, skills, experience, and education.

## Features

- 📄 **PDF Text Extraction** - Extract raw text from PDF resumes
- 👤 **Contact Information** - Parse names, emails, phone numbers, LinkedIn profiles
- 🛠️ **Skills Detection** - Identify technical and professional skills
- 💼 **Experience Extraction** - Extract work history and employment details
- 🎓 **Education Parsing** - Extract educational background and qualifications
- 📝 **Summary Extraction** - Parse professional summaries and objectives
- 🧹 **Auto Cleanup** - Temporary files are automatically deleted after processing
- 🔒 **Security** - File validation, size limits, and secure processing

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

3. **Server will be running at:** `http://localhost:3000`

## API Endpoints

### GET `/`
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Resume Parser API",
  "version": "1.0.0",
  "description": "Extract structured data from PDF resumes",
  "endpoints": {
    "POST /api/parse-resume": "Parse a PDF resume and extract data",
    "GET /api/stats": "Get parser statistics and capabilities",
    "DELETE /api/cleanup": "Clean up temporary files",
    "GET /api/health": "Health check"
  }
}
```

### POST `/api/parse-resume`
Parse a PDF resume and extract structured data.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: PDF file with field name `resume`

**Response:**
```json
{
  "success": true,
  "message": "Resume parsed successfully",
  "originalFilename": "john_doe_resume.pdf",
  "fileSize": 245760,
  "fileSizeFormatted": "240.00 KB",
  "parsedAt": "2024-01-01T12:00:00.000Z",
  "rawText": "John Doe\nSoftware Engineer\n...",
  "extractedData": {
    "contact": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1-555-123-4567",
      "linkedin": "linkedin.com/in/johndoe"
    },
    "skills": ["javascript", "python", "react", "node.js"],
    "experience": ["Software Engineer at ABC Corp", "..."],
    "education": ["BS Computer Science, XYZ University"],
    "summary": "Experienced software engineer with 5+ years..."
  },
  "metadata": {
    "totalPages": 2,
    "textLength": 1543
  }
}
```

### GET `/api/stats`
Get parser statistics and capabilities.

**Response:**
```json
{
  "success": true,
  "service": "Resume Parser API",
  "version": "1.0.0",
  "features": [
    "PDF text extraction",
    "Contact information parsing",
    "Skills detection",
    "Experience extraction",
    "Education parsing",
    "Summary extraction"
  ],
  "supportedFormats": ["PDF"],
  "maxFileSize": "10.00 MB",
  "temporaryStorage": true,
  "autoCleanup": true
}
```

### DELETE `/api/cleanup`
Clean up all temporary files.

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 3 temporary files",
  "deletedCount": 3
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Resume Parser API",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "features": {
    "pdfParsing": true,
    "textExtraction": true,
    "dataStructuring": true,
    "temporaryStorage": true
  }
}
```

## Testing the API

### Using curl:

```bash
# Parse a resume
curl -X POST http://localhost:3000/api/parse-resume \
  -F "resume=@/path/to/resume.pdf"

# Get parser stats
curl http://localhost:3000/api/stats

# Health check
curl http://localhost:3000/api/health

# Clean up temp files
curl -X DELETE http://localhost:3000/api/cleanup
```

### Using a HTML form:

```html
<!DOCTYPE html>
<html>
<body>
    <h2>Resume Parser</h2>
    <form action="http://localhost:3000/api/parse-resume" method="post" enctype="multipart/form-data">
        <input type="file" name="resume" accept=".pdf" required>
        <button type="submit">Parse Resume</button>
    </form>
</body>
</html>
```

### Using JavaScript/Fetch:

```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

fetch('http://localhost:3000/api/parse-resume', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Parsed data:', data.extractedData);
})
.catch(error => console.error('Error:', error));
```

## Configuration

Environment variables can be set in `.env` file:

- `PORT`: Server port (default: 3000)
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `NODE_ENV`: Environment mode (development/production)
- `CLEANUP_TEMP_FILES`: Auto cleanup temporary files (default: true)

## Data Extraction Details

### Contact Information
- **Name**: Extracted from document header/first lines
- **Email**: Pattern matching for email addresses
- **Phone**: Pattern matching for phone numbers
- **LinkedIn**: Extraction of LinkedIn profile URLs

### Skills Detection
Identifies common technical skills including:
- Programming languages (JavaScript, Python, Java, etc.)
- Frameworks (React, Angular, Vue, etc.)
- Databases (MySQL, MongoDB, PostgreSQL, etc.)
- Cloud platforms (AWS, Azure, GCP)
- Development tools (Git, Docker, Kubernetes, etc.)

### Experience & Education
- Extracts sections based on common headers
- Parses job titles, companies, and descriptions
- Identifies educational institutions and degrees

## File Processing

1. **Upload**: PDF file received via multipart/form-data
2. **Temporary Storage**: File saved to `temp/` directory with unique name
3. **Text Extraction**: PDF parsed using `pdf-parse` library
4. **Data Processing**: Raw text processed through extraction algorithms
5. **Cleanup**: Temporary file automatically deleted (configurable)

## Security Features

- **File Type Validation**: Only PDF files accepted
- **File Size Limits**: 10MB maximum file size
- **Path Traversal Protection**: Secure file handling
- **Temporary Storage**: Files not permanently stored
- **Auto Cleanup**: Prevents disk space accumulation
- **CORS & Helmet**: Web security headers

## Error Handling

The API provides detailed error responses for:
- Invalid file types
- File size exceeded
- Parsing failures
- Server errors
- Missing files

## Project Structure

```
outreachDrafter/
├── index.js                           # Main server startup file
├── package.json                       # Dependencies and scripts
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
├── config/
│   └── server.js                     # Server configuration and setup
├── controllers/
│   └── resumeParserController.js     # Main controller functions
├── middleware/
│   └── upload.js                     # Multer upload configuration
├── routes/
│   └── fileRoutes.js                 # API route definitions
├── utils/
│   └── resumeUtils.js                # Utility functions for resume parsing
└── temp/                             # Temporary processing directory
```

## Architecture Pattern

This project follows a clean **MVC-like architecture** with separation of concerns:

- **`index.js`**: Entry point and server startup logic
- **`config/`**: Configuration files and server setup
- **`controllers/`**: Main controller functions for handling HTTP requests/responses
- **`middleware/`**: Request processing middleware for file uploads
- **`routes/`**: API route definitions and endpoint mapping
- **`utils/`**: Utility functions for data extraction and text processing
- **`temp/`**: Temporary file storage during processing

## Use Cases

Perfect for building:
- **HR Management Systems** - Automated resume screening
- **Job Boards** - Resume data extraction for profiles
- **Recruitment Tools** - Candidate information parsing
- **ATS Integration** - Applicant tracking system data input
- **Resume Analytics** - Skills analysis and matching
- **Portfolio Builders** - Automated profile creation

## Dependencies

- **express**: Web framework
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **dotenv**: Environment configuration

## Performance Notes

- Processing time depends on PDF size and complexity
- Typical resume (1-2 pages): ~500ms processing time
- Memory usage scales with file size
- Temporary files cleaned up automatically
- No persistent storage reduces disk usage