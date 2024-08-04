// __tests__/translation-sync.test.js

const TranslationSync = require('../src/translation-sync');

// Mock the https module
jest.mock('https');

describe('TranslationSync', () => {
  let sync;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of TranslationSync before each test
    sync = new TranslationSync('test-project-id', 'test-api-key');
  });

  test('constructor sets projectId and apiKey', () => {
    expect(sync.projectId).toBe('test-project-id');
    expect(sync.apiKey).toBe('test-api-key');
  });

  test('validateLocale accepts valid locales', () => {
    expect(() => sync.validateLocale('en-us')).not.toThrow();
    expect(() => sync.validateLocale('fr-FR')).not.toThrow();
    expect(() => sync.validateLocale('zh_CN')).not.toThrow();
  });

  test('validateLocale rejects invalid locales', () => {
    expect(() => sync.validateLocale('en us')).toThrow();
    expect(() => sync.validateLocale('fr/FR')).toThrow();
    expect(() => sync.validateLocale('zh:CN')).toThrow();
  });

  // Add more tests here as you develop your class
});