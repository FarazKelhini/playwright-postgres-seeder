# playwright-postgres-seeder

A Playwright plugin that provides fixtures and APIs to seed and clean up a PostgreSQL database before and after tests. This makes sure your database stays consistent while running your end-to-end tests with Playwright.

## Features
- Automatic seeding and cleanup via a ready-to-use fixture.
- Exposed helper functions (`seedDatabase`, `cleanDatabase`) for advanced customization.
- Supports single or multiple SQL queries for seeding and cleaning.
- Uses `pg` for PostgreSQL connectivity.
- Compatible with Playwright's test extension mechanism.

## Installation

Install the package via npm:

```bash
npm install playwright-postgres-seeder
```

This package has a peer dependency on `@playwright/test` (version ^1.46.1 or compatible) and depends on `pg` for database interactions.

## Usage

### Basic Usage: Happy Path Fixture

Extend your Playwright test with the `dbSeeder` fixture. Provide your database connection details and SQL queries for seeding and cleaning.

```typescript
// tests/example.spec.ts
import { test as base } from '@playwright/test';
import { extendWithSeeder } from 'playwright-postgres-seeder';

const options = {
  connection: {
    connectionString: 'postgres://user:pass@localhost:5432/dbname',
  },
  seedSql: 'INSERT INTO users (name) VALUES (\'testuser\');',
  cleanSql: 'DELETE FROM users WHERE name = \'testuser\';',
};

const test = extendWithSeeder(base, options);

test('example test', async ({ page, dbSeeder }) => {
  // The dbSeeder fixture automatically seeds the database before this block runs
  // and cleans it up afterward. No need to manually call anything here.
  
  await page.goto('http://localhost:3000');
  // Perform your test assertions; the database is in the seeded state.
  // For example:
  // await page.getByRole('button', { name: /submit/i }).click();
});
```

**Notes:**
- The `dbSeeder` fixture returns `void`. It's for side effects only. Include it in your test parameters to activate the seeding/cleanup.
- `seedSql` and `cleanSql` can be strings or arrays of strings for multiple queries:
  ```javascript
  seedSql: [
    'INSERT INTO users ...',
    'INSERT INTO orders ...',
  ],
  ```
- Errors during seeding or cleanup will cause the test to fail, as per Playwright's fixture behavior.

### Advanced Usage: Custom Fixture

For more control, you can build your own fixture. This is useful for scenarios like mid-test re-seeding.

Here's a complete example:

```typescript
// tests/advanced-usage.spec.ts
import { test as base } from '@playwright/test';
import { Pool } from 'pg';
import { seedDatabase, cleanDatabase, type SeederOptions } from 'playwright-postgres-seeder';

const options: SeederOptions = {
  connection: {
    connectionString: 'postgres://myuser:mypassword@127.0.0.1:5432/mydatabase',
  },
  seedSql: [
    'INSERT INTO users (id, name, email) VALUES (1, \'Alice\', \'alice@test.com\')'
  ],
  cleanSql: 'DELETE FROM users WHERE id = 1'
};

// Custom fixture that provides seed/clean control
const test = base.extend<{ db: { seed: () => Promise<void>, clean: () => Promise<void> } }>({
  db: async ({}, use) => {
    const pool = new Pool(options.connection);
    await seedDatabase(pool, options.seedSql);
    
    await use({
      seed: () => seedDatabase(pool, options.seedSql),
      clean: () => cleanDatabase(pool, options.cleanSql),
    });
    
    await cleanDatabase(pool, options.cleanSql);
    await pool.end();
  },
});

test('test with manual seeding control', async ({ page, db }) => {
  // Database is pre-seeded with Alice and her order
  
  await page.goto('http://localhost:3000/dashboard');
  
  // Verify initial state
  await expect(page.locator('text=Welcome, Alice')).toBeVisible();
  await expect(page.locator('text=$100.00')).toBeVisible();
  
  // Clean and re-seed mid-test (e.g., to test different scenarios)
  await db.clean();
  await db.seed();
  
  // Test a new scenario
});
```

This custom fixture:
- Pre-seeds the database before the test.
- Provides `seed()` and `clean()` methods for manual control during the test.
- Cleans up automatically after the test.
- Manages the connection pool lifecycle.

Use this approach for complex tests requiring multiple database states within a single test run.

## Configuration Options

The `SeederOptions` interface:

```typescript
interface SeederOptions {
  connection: PoolConfig; // From 'pg' like { connectionString: 'postgres://...' }
  seedSql: string | string[]; // SQL to insert/test data
  cleanSql: string | string[]; // SQL to remove/test data
}
```

## Dependencies

- `pg`: ^8.12.0 (for PostgreSQL client)
- Peer: `@playwright/test`: ^1.46.1


## License

MIT


