"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
exports.seedDatabase = seedDatabase;
exports.cleanDatabase = cleanDatabase;
exports.createSeederFixture = createSeederFixture;
exports.extendWithSeeder = extendWithSeeder;
// src/index.ts
const test_1 = require("@playwright/test");
const pg_1 = require("pg");
/**
 * Helper function to perform seeding.
 * @param pool - The PostgreSQL pool instance.
 * @param seedSql - The seed SQL queries.
 */
async function seedDatabase(pool, seedSql) {
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
async function cleanDatabase(pool, cleanSql) {
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
function createSeederFixture(options) {
    return async ({}, use) => {
        const pool = new pg_1.Pool(options.connection);
        try {
            await seedDatabase(pool, options.seedSql);
            await use();
        }
        finally {
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
function extendWithSeeder(base, options) {
    return base.extend({
        dbSeeder: createSeederFixture(options),
    });
}
// Export the base test with the seeder for convenience
exports.test = test_1.test;
// For convenience, export a pre-extended test assuming users will use extendWithSeeder.
// But to satisfy "export a ready-to-use fixture," users can directly use createSeederFixture in their extend.
