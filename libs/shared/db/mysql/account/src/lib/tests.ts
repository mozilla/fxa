/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { Kysely, sql } from 'kysely';

import { DB, setupAccountDatabase } from '@fxa/shared/db/mysql/account';

const SQL_FILE_LOCATION = '../test';

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

  const testDbName = `testAccount-${crypto.randomUUID()}`;

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
