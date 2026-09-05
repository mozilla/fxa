/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { Kysely, sql } from 'kysely';

import {
  AccountDatabase,
  DB,
  setupAccountDatabase,
} from '@fxa/shared/db/mysql/account';

const SQL_FILE_LOCATION = '../test';
const TEST_SCHEMA_PREFIX = 'testAccount-';

// Wide enough that a schema from a concurrent run is never old enough to sweep.
const ORPHAN_SCHEMA_MAX_AGE_HOURS = 3;

export type ACCOUNT_TABLES =
  | 'accounts'
  | 'accountCustomers'
  | 'paypalCustomers'
  | 'carts'
  | 'recoveryCodes'
  | 'recoveryPhones'
  | 'emails'
  | 'passkeys'
  | 'passkeyWraps';

/**
 * Creates a throwaway database and loads the given fixtures in order. List
 * a table after any table its foreign keys reference to avoid MySQL errors.
 *
 * @param tables - List of table names to load, in order
 * @returns Kysely instance connected to the throwaway database
 * @throws If the database cannot be created or the SQL files cannot be loaded
 */
export async function testAccountDatabaseSetup(
  tables: ACCOUNT_TABLES[]
): Promise<Kysely<DB>> {
  // Create the db if it doesn't exist
  let db = await setupAccountDatabase({
    host: 'localhost',
    database: '',
    password: '',
    port: 3306,
    user: 'root',
  });

  await dropOrphanedTestSchemas(db);

  const testDbName = `${TEST_SCHEMA_PREFIX}${crypto.randomUUID()}`;

  await sql`DROP DATABASE IF EXISTS ${sql.table(testDbName)}`.execute(db);
  await sql`CREATE DATABASE ${sql.table(testDbName)}`.execute(db);
  await db.destroy();

  db = await setupAccountDatabase({
    host: 'localhost',
    database: testDbName,
    password: '',
    port: 3306,
    user: 'root',
  });

  await runSql(
    db,
    tables.map((x) => `${SQL_FILE_LOCATION}/${x}.sql`)
  );

  return db;
}

/**
 * Drops the throwaway schema and closes the connection.
 *
 * Asks the connection for its own schema instead of making each test track
 * the name, which keeps the testAccountDatabaseSetup signature unchanged.
 */
export async function testAccountDatabaseTeardown(db?: AccountDatabase) {
  if (!db) {
    // Setup threw, so there is nothing to clean up.
    return;
  }

  try {
    const name = await currentSchema(db);
    if (name?.startsWith(TEST_SCHEMA_PREFIX)) {
      await sql`DROP DATABASE IF EXISTS ${sql.table(name)}`.execute(db);
    }
  } finally {
    // Always close the pool. A leaked pool exhausts connections later.
    await db.destroy();
  }
}

async function currentSchema(db: AccountDatabase) {
  const result = await sql<{
    name: string | null;
  }>`SELECT DATABASE() AS name`.execute(db);
  return result.rows[0]?.name;
}

/**
 * Drops throwaway schemas left behind by runs that crashed or were killed
 * before their teardown. Age based rather than sweep all, so a concurrent run
 * keeps its schema.
 *
 * A schema with no tables has no row in information_schema.TABLES, so a run
 * killed between CREATE DATABASE and the table SQL stays behind. SCHEMATA has
 * no create time to work from, so that gap is accepted.
 */
async function dropOrphanedTestSchemas(db: AccountDatabase) {
  try {
    const result = await sql<{ name: string }>`
      SELECT TABLE_SCHEMA AS name
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA LIKE ${TEST_SCHEMA_PREFIX + '%'}
      GROUP BY TABLE_SCHEMA
      HAVING MAX(CREATE_TIME) < NOW() - INTERVAL ${sql.lit(
        ORPHAN_SCHEMA_MAX_AGE_HOURS
      )} HOUR
    `.execute(db);

    for (const { name } of result.rows) {
      await sql`DROP DATABASE IF EXISTS ${sql.table(name)}`.execute(db);
    }
  } catch (err) {
    // Two suites can sweep at once and race for the same schema. Cleanup of
    // old junk must never fail the run that is starting.
    console.warn('Could not sweep orphaned test schemas', err);
  }
}

/**
 * Sequential, not Promise.all: a table with a foreign key must be created after
 * the table it references, or MySQL fails with "Failed to open the referenced
 * table".
 */
async function runSql(db: Kysely<DB>, filePaths: string[]) {
  for (const filePath of filePaths) {
    const contents = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    await sql`${sql.raw(contents)}`.execute(db);
  }
}
