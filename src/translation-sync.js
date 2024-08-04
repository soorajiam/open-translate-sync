const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

class TranslationSync {
  constructor(projectId = process.env.OPENTRANSLATE_PROJECT_ID, apiKey = process.env.OPENTRANSLATE_API_KEY, baseUrl = 'opentranslate.dev') {
    if (!projectId || !apiKey) {
      throw new Error('Project ID and API Key are required. Set OPENTRANSLATE_PROJECT_ID and OPENTRANSLATE_API_KEY in your .env file or pass them to the constructor.');
    }
    this.projectId = projectId;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.rateLimitWindowMs = 60000; // 1 minute
    this.maxRequestsPerWindow = 100;
    this.requestTimestamps = [];
  }

  validateLocale(locale) {
    // Only allow alphanumeric characters, hyphens, and underscores
    const validLocaleRegex = /^[a-zA-Z0-9-_]+$/;
    if (!validLocaleRegex.test(locale)) {
      throw new Error(`Invalid locale format: ${locale}`);
    }
  }

  sanitizeJson(json) {
    // Implement JSON sanitization logic here
    // For example, remove or escape potentially harmful characters
    return json;
  }

  isRateLimited() {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => now - timestamp < this.rateLimitWindowMs);
    if (this.requestTimestamps.length >= this.maxRequestsPerWindow) {
      return true;
    }
    this.requestTimestamps.push(now);
    return false;
  }

  makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      if (this.isRateLimited()) {
        reject(new Error('Rate limit exceeded. Please try again later.'));
        return;
      }

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(JSON.stringify(postData));
      }

      req.end();
    });
  }

  async uploadTranslation(locale, content) {
    this.validateLocale(locale);
    const sanitizedContent = this.sanitizeJson(content);
    const options = {
      hostname: this.baseUrl,
      port: 443,
      path: `/projects/${this.projectId}/upload/${locale}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      rejectUnauthorized: true, // Reject invalid SSL certificates
    };

    return this.makeRequest(options, sanitizedContent);
  }

  async downloadTranslation(locale) {
    this.validateLocale(locale);
    const options = {
      hostname: this.baseUrl,
      port: 443,
      path: `/projects/${this.projectId}/download/${locale}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      rejectUnauthorized: true, // Reject invalid SSL certificates
    };

    return this.makeRequest(options);
  }

  async saveTranslation(locale, content, outputDir) {
    try {
      this.validateLocale(locale);
      const sanitizedContent = this.sanitizeJson(content);
      const absoluteOutputDir = path.resolve(outputDir);
      await fs.mkdir(absoluteOutputDir, { recursive: true });
      const filePath = path.join(absoluteOutputDir, `${locale}.json`);
      const resolvedFilePath = path.resolve(filePath);
      
      // Ensure the file path is within the intended directory
      if (!resolvedFilePath.startsWith(absoluteOutputDir)) {
        throw new Error('Invalid file path');
      }

      await fs.writeFile(resolvedFilePath, JSON.stringify(sanitizedContent, null, 2));
      console.log(`Saved translations for ${locale} to ${resolvedFilePath}`);
    } catch (error) {
      console.error(`Error saving translations for ${locale}:`, error.message);
      throw error;
    }
  }

  async loadTranslation(inputDir, locale) {
    try {
      this.validateLocale(locale);
      const absoluteInputDir = path.resolve(inputDir);
      const filePath = path.join(absoluteInputDir, `${locale}.json`);
      const resolvedFilePath = path.resolve(filePath);
      
      // Ensure the file path is within the intended directory
      if (!resolvedFilePath.startsWith(absoluteInputDir)) {
        throw new Error('Invalid file path');
      }

      const content = await fs.readFile(resolvedFilePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading translations for ${locale}:`, error.message);
      return null;
    }
  }

  async syncLocale(locale, dir) {
    console.log(`Syncing locale: ${locale}`);
    
    // Step 1: Upload current translation
    const currentTranslation = await this.loadTranslation(dir, locale);
    if (currentTranslation) {
      await this.uploadTranslation(locale, currentTranslation);
      console.log(`Uploaded translations for ${locale}`);
    } else {
      console.log(`No existing translations found for ${locale}, skipping upload`);
    }

    // Step 2: Download updated translation
    const updatedTranslation = await this.downloadTranslation(locale);
    await this.saveTranslation(locale, updatedTranslation, dir);
    console.log(`Downloaded and saved updated translations for ${locale}`);
  }

  async sync(dir, locales = null) {
    try {
      if (!locales) {
        // If no locales specified, read all JSON files in the directory
        const files = await fs.readdir(dir);
        locales = files
          .filter(file => path.extname(file) === '.json')
          .map(file => path.basename(file, '.json'));
      }

      for (const locale of locales) {
        await this.syncLocale(locale, dir);
      }

      console.log('Translation sync completed successfully');
    } catch (error) {
      console.error('Translation sync failed:', error.message);
    }
  }
}

module.exports = TranslationSync;