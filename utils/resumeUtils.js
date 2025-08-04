import fs from 'fs';
import path from 'path';

// ===============================
// FILE UTILITIES
// ===============================

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up temporary file: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

// ===============================
// TEXT PROCESSING UTILITIES
// ===============================

export const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
};

export const extractTextBetweenKeywords = (text, startKeywords, endKeywords = []) => {
  const lines = text.split('\n');
  const extractedLines = [];
  let isExtracting = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check for start keywords
    if (startKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
      isExtracting = true;
      continue;
    }
    
    // Check for end keywords
    if (isExtracting && endKeywords.length > 0) {
      if (endKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
        break;
      }
    }
    
    // Extract content
    if (isExtracting && line.trim().length > 0) {
      extractedLines.push(line.trim());
    }
  }
  
  return extractedLines;
};

// ===============================
// CONTACT INFORMATION EXTRACTION
// ===============================

export const extractContactInfo = (text) => {
  const contact = {};
  
  // Email extraction
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  contact.email = emails ? emails[0] : null;

  // Phone extraction with multiple patterns
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // US format
    /\+?\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g     // International format
  ];
  
  for (const pattern of phonePatterns) {
    const phones = text.match(pattern);
    if (phones) {
      contact.phone = phones[0];
      break;
    }
  }

  // LinkedIn extraction
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/gi;
  const linkedin = text.match(linkedinRegex);
  contact.linkedin = linkedin ? `https://${linkedin[0]}` : null;

  // GitHub extraction
  const githubRegex = /github\.com\/[\w-]+/gi;
  const github = text.match(githubRegex);
  contact.github = github ? `https://${github[0]}` : null;

  // Website/Portfolio extraction
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w]{2,}(?:\/[\w-]*)?/gi;
  const websites = text.match(websiteRegex);
  if (websites) {
    // Filter out email domains and social media
    const filteredWebsites = websites.filter(site => 
      !site.includes('@') && 
      !site.includes('linkedin.com') && 
      !site.includes('github.com') &&
      !site.includes('facebook.com') &&
      !site.includes('twitter.com')
    );
    contact.website = filteredWebsites.length > 0 ? filteredWebsites[0] : null;
  }

  // Name extraction (enhanced approach)
  contact.name = extractName(text);

  return contact;
};

export const extractName = (text) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines.slice(0, 5)) { // Check first 5 lines
    const trimmedLine = line.trim();
    
    // Skip lines with common resume keywords
    const skipKeywords = ['resume', 'cv', 'curriculum vitae', 'phone', 'email', 'address'];
    if (skipKeywords.some(keyword => trimmedLine.toLowerCase().includes(keyword))) {
      continue;
    }
    
    // Look for name patterns (2-4 words, each starting with capital letter)
    const namePattern = /^[A-Z][a-z]+(?: [A-Z][a-z]+){1,3}$/;
    if (namePattern.test(trimmedLine) && trimmedLine.length < 50) {
      return trimmedLine;
    }
  }
  
  return null;
};

// ===============================
// SKILLS EXTRACTION
// ===============================

export const extractSkills = (text) => {
  const skillsDatabase = {
    programming: [
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
      'kotlin', 'scala', 'typescript', 'r', 'matlab', 'perl', 'shell', 'bash'
    ],
    frameworks: [
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'laravel', 'rails', 'asp.net', '.net', 'jquery', 'bootstrap', 'tailwind'
    ],
    databases: [
      'mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'cassandra', 'oracle',
      'sql server', 'dynamodb', 'elasticsearch', 'firebase'
    ],
    cloud: [
      'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean', 'kubernetes',
      'docker', 'jenkins', 'terraform', 'ansible'
    ],
    tools: [
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
      'trello', 'figma', 'sketch', 'photoshop', 'illustrator', 'excel', 'powerpoint'
    ],
    methodologies: [
      'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices',
      'restful api', 'graphql', 'machine learning', 'ai', 'data science'
    ]
  };

  const lowerText = text.toLowerCase();
  const foundSkills = {};

  // Extract skills by category
  for (const [category, skills] of Object.entries(skillsDatabase)) {
    const categorySkills = skills.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
    
    if (categorySkills.length > 0) {
      foundSkills[category] = categorySkills;
    }
  }

  // Return flat array for backward compatibility, but include categorized skills
  const allSkills = Object.values(foundSkills).flat();
  
  return {
    all: allSkills,
    categorized: foundSkills,
    count: allSkills.length
  };
};

// ===============================
// EXPERIENCE EXTRACTION
// ===============================

export const extractExperience = (text) => {
  const experienceKeywords = [
    'experience', 'work history', 'employment', 'career', 'professional experience',
    'work experience', 'employment history'
  ];
  
  const stopKeywords = ['education', 'skills', 'projects', 'certifications'];
  
  const experienceData = extractTextBetweenKeywords(text, experienceKeywords, stopKeywords);
  
  // Parse individual job entries
  const jobs = parseJobEntries(experienceData);
  
  return {
    raw: experienceData,
    parsed: jobs,
    count: jobs.length
  };
};

export const parseJobEntries = (experienceLines) => {
  const jobs = [];
  let currentJob = null;
  
  for (const line of experienceLines) {
    // Check if line contains dates (likely a job header)
    const datePattern = /\b(19|20)\d{2}\b/;
    const companyIndicators = ['inc', 'corp', 'llc', 'ltd', 'company', 'technologies', 'solutions'];
    
    if (datePattern.test(line) || companyIndicators.some(indicator => 
      line.toLowerCase().includes(indicator))) {
      
      // Save previous job if exists
      if (currentJob) {
        jobs.push(currentJob);
      }
      
      // Start new job
      currentJob = {
        title: null,
        company: null,
        duration: null,
        description: [],
        rawLine: line
      };
      
      // Try to parse title, company, and duration from the line
      const parsed = parseJobLine(line);
      Object.assign(currentJob, parsed);
      
    } else if (currentJob && line.trim().length > 0) {
      // Add to current job description
      currentJob.description.push(line.trim());
    }
  }
  
  // Add the last job
  if (currentJob) {
    jobs.push(currentJob);
  }
  
  return jobs;
};

export const parseJobLine = (line) => {
  // This is a simplified parser - could be enhanced with more sophisticated NLP
  const datePattern = /\b(19|20)\d{2}\b/g;
  const dates = line.match(datePattern);
  
  return {
    title: null, // Would need more sophisticated parsing
    company: null, // Would need more sophisticated parsing
    duration: dates ? dates.join(' - ') : null
  };
};

// ===============================
// EDUCATION EXTRACTION
// ===============================

export const extractEducation = (text) => {
  const educationKeywords = [
    'education', 'academic', 'university', 'college', 'degree', 'bachelor',
    'master', 'phd', 'doctorate', 'certification', 'diploma'
  ];
  
  const stopKeywords = ['experience', 'skills', 'projects'];
  
  const educationData = extractTextBetweenKeywords(text, educationKeywords, stopKeywords);
  
  // Parse individual education entries
  const education = parseEducationEntries(educationData);
  
  return {
    raw: educationData,
    parsed: education,
    count: education.length
  };
};

export const parseEducationEntries = (educationLines) => {
  const education = [];
  const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate'];
  
  for (const line of educationLines) {
    if (degreeKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      education.push({
        degree: line.trim(),
        institution: null, // Would need more sophisticated parsing
        year: extractYear(line),
        rawLine: line
      });
    }
  }
  
  return education;
};

export const extractYear = (text) => {
  const yearPattern = /\b(19|20)\d{2}\b/g;
  const years = text.match(yearPattern);
  return years ? years[years.length - 1] : null; // Return the latest year
};

// ===============================
// SUMMARY/OBJECTIVE EXTRACTION
// ===============================

export const extractSummary = (text) => {
  const summaryKeywords = [
    'summary', 'objective', 'profile', 'about', 'overview', 'introduction',
    'professional summary', 'career objective', 'personal statement'
  ];
  
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase();
    
    if (summaryKeywords.some(keyword => lowerLine.includes(keyword))) {
      // Get next few lines as summary
      const summaryLines = [];
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        // Stop if we hit another section
        if (nextLine.toLowerCase().includes('experience') || 
            nextLine.toLowerCase().includes('education') ||
            nextLine.toLowerCase().includes('skills')) {
          break;
        }
        
        if (nextLine.length > 0) {
          summaryLines.push(nextLine);
        }
      }
      
      const summary = summaryLines.join(' ').trim();
      return summary.length > 0 ? summary : null;
    }
  }
  
  return null;
};

// ===============================
// MAIN DATA EXTRACTION ORCHESTRATOR
// ===============================

export const extractResumeData = (text) => {
  const cleanedText = cleanText(text);
  
  return {
    contact: extractContactInfo(cleanedText),
    skills: extractSkills(cleanedText),
    experience: extractExperience(cleanedText),
    education: extractEducation(cleanedText),
    summary: extractSummary(cleanedText)
  };
};