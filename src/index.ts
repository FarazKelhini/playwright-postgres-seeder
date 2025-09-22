import { test as baseTest, type TestType } from '@playwright/test';
import { Pool, type PoolConfig } from 'pg';

/**
 * Options for configuring the database seeder.
 */
export interface SeederOptions {
  /** PostgreSQL connection configuration (accepts PoolConfig from 'pg'). */
  connection: PoolConfig;
  /** SQL query or queries to seed the database (like INSERT statements). Can be a string or array of strings. */
  seedSql: string | string[];
  /** SQL query or queries to clean up the database (like DELETE or TRUNCATE statements). Can be a string or array of strings. */
  cleanSql: string | string[];
}

/**
 * Helper function to perform seeding.
 * @param pool - The PostgreSQL pool instance.
 * @param seedSql - The seed SQL queries.
 */
export async function seedDatabase(pool: Pool, seedSql: string | string[]): Promise<void> {
  const queries = Array.isArray(seedSql) ? seedSql : [seedSql];
  for (const query of queries) {
    await pool.query(query);
  }
}

/**
 * Helper function to perform cleanup.
 * @param pool - The PostgreSQL pool instance.
 * @param cleanSql - The cleanup SQL queries.
 */
export async function cleanDatabase(pool: Pool, cleanSql: string | string[]): Promise<void> {
  const queries = Array.isArray(cleanSql) ? cleanSql : [cleanSql];
  for (const query of queries) {
    await pool.query(query);
  }
}

/**
 * Creates a Playwright fixture for automatic database seeding and cleanup.
 * The fixture seeds the database before the test and cleans it up after.
 * It provides no value to the test (use it for side effects only).
 * 
 * For advanced usage, you can create your own fixture using the seedDatabase and cleanDatabase helpers.
 * 
 * @param options - The seeder configuration options.
 * @returns A fixture function compatible with Playwright's extend.
 */
export function createSeederFixture(options: SeederOptions) {
  return async ({}, use: (value: void) => Promise<void>) => {
    const pool = new Pool(options.connection);
    try {
      await seedDatabase(pool, options.seedSql);
      await use();
    } finally {
      await cleanDatabase(pool, options.cleanSql);
      await pool.end();
    }
  };
}

/**
 * Extends the base Playwright test with the dbSeeder fixture for the "happy path."
 * Usage:
 * 
 * import { extendWithSeeder } from 'playwright-postgres-seeder';
 * import { test as base } from '@playwright/test';
 * 
 * const options = { connection: { connectionString: 'postgres://...' }, seedSql: '...', cleanSql: '...' };
 * const test = extendWithSeeder(base, options);
 * 
 * test('my test', async ({ page, dbSeeder }) => {
 *   // Database is seeded here; proceed with test
 * });
 */
export function extendWithSeeder(base: TestType<any, any>, options: SeederOptions) {
  return base.extend<{ dbSeeder: void }>({
    dbSeeder: createSeederFixture(options),
  });
}

// Export the base test with the seeder for convenience
export const test = baseTest;

// For convenience, export a pre-extended test assuming users will use extendWithSeeder.
// But to satisfy "export a ready-to-use fixture," users can directly use createSeederFixture in their extend.