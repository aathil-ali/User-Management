import { DatabaseTestHelper } from './helpers/DatabaseTestHelper';
import { TestConfig } from './helpers/TestConfig';

/**
 * Validate test environment setup
 * This script can be run to ensure the test environment is properly configured
 */
async function validateTestEnvironment(): Promise<void> {
  console.log('🔍 Validating test environment...');

  try {
    // Check environment variables
    console.log('📋 Checking environment variables...');
    const testEnv = TestConfig.getTestEnv();
    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'POSTGRES_HOST',
      'POSTGRES_DB',
      'MONGODB_URI'
    ];

    for (const varName of requiredVars) {
      if (!testEnv[varName as keyof typeof testEnv]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }
    console.log('✅ Environment variables configured');

    // Test database connections (only for integration/e2e tests)
    if (TestConfig.shouldUseRealDatabase()) {
      console.log('🔌 Testing database connections...');
      
      await DatabaseTestHelper.setupTestDatabase();
      console.log('✅ Database connections successful');
      
      await DatabaseTestHelper.teardownTestDatabase();
      console.log('✅ Database cleanup successful');
    } else {
      console.log('⏭️  Skipping database tests (unit test mode)');
    }

    console.log('🎉 Test environment validation successful!');
  } catch (error) {
    console.error('❌ Test environment validation failed:', error);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateTestEnvironment();
}

export { validateTestEnvironment };