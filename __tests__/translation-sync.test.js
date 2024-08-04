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

  const https = require('https');

test('fetchTranslations makes correct HTTPS request', async () => {
  const mockResponse = {
    on: jest.fn((event, callback) => {
      if (event === 'data') callback(JSON.stringify({ key: 'value' }));
      if (event === 'end') callback();
    }),
    statusCode: 200,
  };
  
  const mockRequest = {
    on: jest.fn((event, callback) => {}),
    end: jest.fn(),
  };

  https.request.mockImplementation((options, callback) => {
    callback(mockResponse);
    return mockRequest;
  });

  const result = await sync.fetchTranslations();

  expect(https.request).toHaveBeenCalledWith(
    expect.objectContaining({
      hostname: 'api.yourtranslationapp.com',
      path: '/projects/test-project-id/translations',
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-api-key',
      }),
    }),
    expect.any(Function)
  );

  expect(result).toEqual({ key: 'value' });
});
});