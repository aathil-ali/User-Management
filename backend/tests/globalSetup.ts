import { DatabaseTestHelper } from './helpers/DatabaseTestHelper';

export default async function globalSetup(): Promise<void> {
  console.log('🚀 Setting up test environment...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Initialize test databases for integration and e2e tests
  try {
    await DatabaseTestHelper.initializeTestDatabases();
    console.log('✅ Test databases initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test databases:', error);
    throw error;
  }
  
  console.log('✅ Test environment setup complete');
}