/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import knex from 'knex';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { appendFile, open } from 'node:fs/promises';

let usersWithoutKeys = 0;
let usersWithKeys = 0;

const run = Date.now();
const argv = yargs(hideBin(process.argv))
  .options({
    // TODO: Make start /stop
    start: { type: 'string', default: '2024-10-02' },
    stop: { type: 'string', default: '2024-10-03' },
    // When provided, skips the initial query and just runs
    // off a local file.
    usersFile: { type: 'string', default: '' },
    sanityCheckUserDestroyedKeys: { type: 'boolean', default: false },
    sanityCheckUpdatedAccounts: { type: 'boolean', default: false },
    checkForMissingKeys: { type: 'boolean', default: false },
    updateMissingKeys: { type: 'boolean', default: false },
  })
  .parseSync();

const connectionCache = {};
let mainKnex;
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

async function processUser(row) {
  // Record user id.
  console.log('Checking for user: ', row.email);

  if (argv.sanityCheckUserDestroyedKeys) {
    console.log('Sanity checking for destroyed recovery keys.');
    const result = await mainKnex.raw(
      `SELECT accounts.uid
       FROM accounts join securityEvents on accounts.uid = securityEvents.uid
       WHERE
        accounts.uid=?
        AND accounts.keysChangedAt < securityEvents.createdAt
        AND (securityEvents.nameId = 18 or securityEvents.nameId = 14)`,
      [uid]
    );

    if (result[0].length > 0) {
      console.log(
        'Account with restored recovery keys deleted post-facto.',
        row.uid.toString('hex')
      );
      await record(`accounts_with_deleted_keys.${run}.txt`, result[0][0].uid);
    }
  }

  if (argv.sanityCheckUpdatedAccounts) {
    console.log('Running sanity check on updated accounts.');
    const backupKnex = await getKnexConnection('BACKUP');
    const query = `
      SELECT COUNT(recoveryKeys.uid) as count
      FROM recoveryKeys
      WHERE recoveryKeys.uid=?`;

    const resultPre = await backupKnex.raw(query, row.uid);
    const countPre = resultPre[0][0].count;

    const resultPost = await mainKnex.raw(query, row.uid);
    const countPost = resultPost[0][0].count;

    if (countPre === 0 && countPost === 1) {
      console.log('Found updated accounted: ', row.uid.toString('hex'));
      await record(`accounts_updated.${run}.txt`, row.uid);
    }
  }

  if (argv.checkForMissingKeys) {
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
      console.log('No recovery key found account for', uid.toString('hex'));
      await record(`accounts_without_recovery_keys.${run}.txt`, uid);
      usersWithoutKeys++;
    } else {
      console.log(
        'Recovery key found account for',
        uid.toString('hex'),
        row.email
      );
      await record(`accounts_with_recovery_keys.${run}.txt`, uid);
      usersWithKeys++;

      // Now we have a recovery, let's restore it
      if (argv.updateMissingKeys) {
        const row = result[0][0];
        console.log('Restoring key in database.', row);
        try {
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
          console.log('Recovery key restored for: ', row.uid.toString('hex'));
        } catch (err) {
          console.log(
            'Failed to update recovery keys for account',
            uid.toString('hex')
          );
          await record(`accounts_with_failed_restore.${run}.txt`, uid);
        }
      }
    }
  }
}

async function main() {
  console.log('ARGS', {
    start: argv.start,
    stop: argv.stop,
    usersFile: argv.usersFile,
    checkForMissingKeys: argv.checkForMissingKeys,
    updateMissingKeys: argv.updateMissingKeys,
  });

  // Connect to production read replica
  mainKnex = await getKnexConnection('PROD');

  if (argv.usersFile) {
    console.log('Reading users from: ', argv.usersFile);
    const file = await open(argv.usersFile);
    for await (const line of file.readLines()) {
      const uid = Buffer.from(line, 'hex');
      const result = await mainKnex.raw(
        `SELECT accounts.uid, emails.email, accounts.keysChangedAt
         FROM accounts join emails on accounts.uid = emails.uid and emails.isPrimary
         WHERE
          accounts.uid=?
          AND accounts.keysChangedAt >= (UNIX_TIMESTAMP(DATE(?))*1000)
          AND accounts.keysChangedAt <= (UNIX_TIMESTAMP(DATE(?))*1000)`,
        [uid, argv.start, argv.stop]
      );
      if (result[0].length === 1) {
        await processUser(result[0][0]);
      } else {
        console.log('Could not locate user: ', uid.toString('hex'));
      }
    }
  } else {
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
    const stream = mainKnex
      .raw(accountsQuery, [argv.start, argv.stop])
      .stream();
    for await (const row of stream) {
      await record(`users-${argv.start}-${argv.stop}.${run}.txt`, row.uid);
      await processUser(row);
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
    console.log('Users With Keys: ', usersWithKeys);
    console.log('Users Without Keys: ', usersWithoutKeys);
    for (const db of Object.values(connectionCache)) {
      await db.destroy();
    }
  });
