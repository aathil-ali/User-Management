import { DatabaseTestHelper } from "./helpers/DatabaseTestHelper";

export default async function globalTeardown(): Promise<void> {
  console.log("🧹 Tearing down test environment...");

  try {
    await DatabaseTestHelper.destroyTestDatabases();
    console.log("✅ Test databases cleaned up");
  } catch (error) {
    console.error("❌ Failed to cleanup test databases:", error);
    // Don't throw here to avoid masking test failures
  }

  console.log("✅ Test environment teardown complete");
}
