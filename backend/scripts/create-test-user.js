import {db} from "../drizzle/index.js";
import {users} from "../drizzle/schema/schema.js";
import {eq} from "drizzle-orm";
import {v4 as uuidv4} from "uuid";

const createTestUser = async () => {
  try {
    console.log("Creating test user...");

    // Use a proper UUID for the test user
    const testUserId = "550e8400-e29b-41d4-a716-446655440000"; // Fixed UUID for test user

    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("Test user already exists:", existingUser[0]);
      return existingUser[0];
    }

    // Create test user
    const testUser = await db
      .insert(users)
      .values({
        id: testUserId,
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isVerified: true,
      })
      .returning();

    console.log("Test user created successfully:", testUser[0]);
    return testUser[0];
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
};

// Run the script
createTestUser()
  .then(() => {
    console.log("Test user setup completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to create test user:", error);
    process.exit(1);
  });
