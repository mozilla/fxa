/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import knex from 'knex';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { appendFile } from 'node:fs/promises';

const run = Date.now();
const argv = yargs(hideBin(process.argv))
  .options({
    // TODO: Make start /stop
    start: { type: 'string', default: '2024-10-02' },
    stop: { type: 'string', default: '2024-10-03' },
    // No writes when true
    dry: { type: 'boolean', default: true },
  })
  .parseSync();

const connectionCache = {};
async function getKnexConnection(dbId) {
  // Use cached instance if possible. We connect to lots of different backups.
  if (connectionCache[dbId]) {
    return connectionCache[dbId];
  }

  const options = {
    client: 'mysql',
    connection: {
      host: process.env[`KNEX_${dbId}_HOST`],
      password: process.env[`KNEX_${dbId}_PWD`],
      port: 3306,
      user: process.env[`KNEX_${dbId}_USER`],
      database: process.env[`KNEX_${dbId}_DB`] || `fxa`,
    },
  };
  const instance = knex(options);
  connectionCache[dbId] = instance;
  return instance;
}

async function restore(backupDate, uid) {
  const backupInstance = await getKnexConnection(backupDate);
  const result = await backupInstance.raw(
    `SELECT * FROM recoveryKeys WHERE uid=?`,
    [uid]
  );
  return result;
}

async function record(filepath, uid) {
  console.log(`Recording ${uid.toString('hex')} > ${filepath}`);
  await appendFile(filepath, uid.toString('hex') + '\n');
}

async function main() {
  console.log('ARGS', {
    start: argv.start,
    stop: argv.stop,
    dry: argv.dry,
  });

  // Connect to production read replica
  const mainKnex = await getKnexConnection('PROD');
  const accountsQuery = `
    SELECT accounts.uid, emails.email, accounts.keysChangedAt
    FROM accounts
      JOIN emails ON
        accounts.uid = emails.uid and emails.isPrimary
    WHERE
      accounts.keysChangedAt >= (UNIX_TIMESTAMP(DATE(?))*1000)
      AND accounts.keysChangedAt <= (UNIX_TIMESTAMP(DATE(?))*1000)
      -- A user that had v2
      AND accounts.verifyHashVersion2 IS NOT NULL
      -- A user that potential had their recovery key deleted
      AND accounts.uid not in (select uid from recoveryKeys)
  `;
  const stream = mainKnex.raw(accountsQuery, [argv.start, argv.stop]).stream();
  for await (const row of stream) {
    console.log('Checking for user: ', row.email);

    const uid = row.uid;
    const keysChangedAt = new Date(row.keysChangedAt);
    let backupDate = keysChangedAt.toISOString().replace(/T.*|-/g, '');
    let result = await restore(backupDate, row.uid);

    // If we didn't get a result, try the previous day
    if (result[0].length === 0) {
      // Subract one day
      keysChangedAt.setDate(keysChangedAt.getDate() - 1);
      backupDate = keysChangedAt.toISOString().replace(/T.*|-/g, '');
      result = await restore(backupDate, row.uid);
    }

    // If we still don't have a result, then user did not have recovery key
    if (result[0].length === 0) {
      console.log('No recovery key found account for', uid, uid);
      await record(`accounts_without_recovery_keys.${run}.txt`, uid);
    } else {
      console.log('Recovery key found account for', uid, row.email);
      // Now we have a recovery, let's restore it
      if (argv.dry === false) {
        const row = result[0][0];
        console.log('Restoring key in database.', row);
        result = await mainKnex.raw(
          `INSERT INTO recoveryKeys (uid, recoveryData, recoveryKeyIdHash, createdAt, verifiedAt, enabled, hint) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            row.uid,
            row.recoveryData,
            row.recoveryKeyIdHash,
            row.createdAt,
            row.verifiedAt,
            row.enabled,
            row.hint,
          ]
        );
      }
      await record(`accounts_with_recovery_keys_restored.${run}.txt`, uid);
    }
  }
  return 0;
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    console.log('Complete!');
    for (const db of Object.values(connectionCache)) {
      await db.destroy();
    }
  });
