import 'reflect-metadata';
import { DatabaseTestHelper } from './helpers/DatabaseTestHelper';

// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Test database configuration
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_DB = 'user_management_test';
process.env.POSTGRES_USER = 'postgres';
process.env.POSTGRES_PASSWORD = 'password';
process.env.MONGODB_URI = 'mongodb://localhost:27017/user_profiles_test';

// Global test timeout
jest.setTimeout(10000);

// Global test setup
beforeAll(async () => {
  // Initialize test database if running integration tests
  if (process.env.TEST_TYPE === 'integration' || process.env.TEST_TYPE === 'e2e') {
    await DatabaseTestHelper.setupTestDatabase();
  }
});

afterAll(async () => {
  // Cleanup test database connections
  if (process.env.TEST_TYPE === 'integration' || process.env.TEST_TYPE === 'e2e') {
    await DatabaseTestHelper.teardownTestDatabase();
  }
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset any global state
  jest.clearAllTimers();
});

afterEach(async () => {
  // Cleanup after each test
  if (process.env.TEST_TYPE === 'integration' || process.env.TEST_TYPE === 'e2e') {
    await DatabaseTestHelper.cleanupTestData();
  }
  
  // Restore any mocked timers
  jest.useRealTimers();
});
