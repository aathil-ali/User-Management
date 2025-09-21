/**
 * Test Configuration Helper
 * Provides utilities for test environment setup and configuration
 */
export class TestConfig {
  /**
   * Get test environment variables with defaults
   */
  static getTestEnv() {
    return {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret-for-testing-only',
      JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-for-testing-only',
      JWT_EXPIRES_IN: '1h',
      JWT_REFRESH_EXPIRES_IN: '7d',
      POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
      POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
      POSTGRES_DB: process.env.POSTGRES_DB || 'user_management_test',
      POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/user_profiles_test',
    };
  }

  /**
   * Setup test environment variables
   */
  static setupTestEnv(): void {
    const testEnv = this.getTestEnv();
    Object.entries(testEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  /**
   * Check if we're running in test environment
   */
  static isTestEnvironment(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  /**
   * Get test type (unit, integration, e2e)
   */
  static getTestType(): string {
    return process.env.TEST_TYPE || 'unit';
  }

  /**
   * Check if we should use real database connections
   */
  static shouldUseRealDatabase(): boolean {
    const testType = this.getTestType();
    return testType === 'integration' || testType === 'e2e';
  }

  /**
   * Get test timeout based on test type
   */
  static getTestTimeout(): number {
    const testType = this.getTestType();
    switch (testType) {
      case 'unit':
        return 5000; // 5 seconds
      case 'integration':
        return 10000; // 10 seconds
      case 'e2e':
        return 30000; // 30 seconds
      default:
        return 10000;
    }
  }

  /**
   * Get Jest configuration for specific test type
   */
  static getJestConfig(testType: 'unit' | 'integration' | 'e2e') {
    const baseConfig = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testTimeout: this.getTestTimeout(),
    };

    switch (testType) {
      case 'unit':
        return {
          ...baseConfig,
          testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
          collectCoverageFrom: [
            'src/**/*.ts',
            '!src/**/*.d.ts',
            '!src/app.ts',
            '!src/index.ts',
            '!src/database/migrations/**',
            '!src/database/seeders/**',
            '!src/config/**',
          ],
        };
      case 'integration':
        return {
          ...baseConfig,
          testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
          globalSetup: '<rootDir>/tests/globalSetup.ts',
          globalTeardown: '<rootDir>/tests/globalTeardown.ts',
        };
      case 'e2e':
        return {
          ...baseConfig,
          testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
          globalSetup: '<rootDir>/tests/globalSetup.ts',
          globalTeardown: '<rootDir>/tests/globalTeardown.ts',
          testTimeout: 30000,
        };
      default:
        return baseConfig;
    }
  }
}