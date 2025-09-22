import { type TestType } from '@playwright/test';
import { Pool, type PoolConfig } from 'pg';
/**
 * Options for configuring the database seeder.
 */
export interface SeederOptions {
    /** PostgreSQL connection configuration (accepts PoolConfig from 'pg'). */
    connection: PoolConfig;
    /** SQL query or queries to seed the database (e.g., INSERT statements). Can be a string or array of strings. */
    seedSql: string | string[];
    /** SQL query or queries to clean up the database (e.g., DELETE or TRUNCATE statements). Can be a string or array of strings. */
    cleanSql: string | string[];
}
/**
 * Helper function to perform seeding.
 * @param pool - The PostgreSQL pool instance.
 * @param seedSql - The seed SQL queries.
 */
export declare function seedDatabase(pool: Pool, seedSql: string | string[]): Promise<void>;
/**
 * Helper function to perform cleanup.
 * @param pool - The PostgreSQL pool instance.
 * @param cleanSql - The cleanup SQL queries.
 */
export declare function cleanDatabase(pool: Pool, cleanSql: string | string[]): Promise<void>;
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
export declare function createSeederFixture(options: SeederOptions): ({}: {}, use: (value: void) => Promise<void>) => Promise<void>;
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
export declare function extendWithSeeder(base: TestType<any, any>, options: SeederOptions): TestType<any, any>;
export declare const test: TestType<import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions>;
