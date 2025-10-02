/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/
  This script is used to perform a one-time cleanup of all Pocket OAuth
  access tokens stored in fxa_oauth.tokens. Pocket was FxA's first OAuth client
  and used a special workaround where access tokens were persisted in MySQL
  instead of Redis to avoid implementing refresh tokens.

  This script will:
  1. Delete all access tokens for Pocket client IDs from the tokens table
  2. Optionally run in dry-run mode to see what would be deleted
/*/

import { StatsD } from 'hot-shots';
import program from 'commander';
import { setupDatabase } from 'fxa-shared/db';
import { BaseAuthModel } from 'fxa-shared/db/models/auth';

const pckg = require('../package.json');
const config = require('../config').default.getProperties();
const statsd = new StatsD(config.statsd);
const log = require('../lib/log')(
  config.log.level,
  'prune-pocket-access-tokens',
  statsd
);

// Pocket client IDs from config
const POCKET_CLIENT_IDS = [
  '749818d3f2e7857f', // pocket-web
  '7377719276ad44ee', // pocket-mobile
];

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_WAIT_MS = 1000;

export async function init() {
  program
    .version(pckg.version)
    .option(
      '--dry-run [boolean]',
      'Run in dry-run mode to see what would be deleted without actually deleting (default: true)',
      true
    )
    .option(
      '--batch-size <number>',
      'Number of tokens to delete per batch (default: 1000)',
      DEFAULT_BATCH_SIZE.toString()
    )
    .option(
      '--wait <number>',
      'Milliseconds to wait between batches in ms (default: 1000)',
      DEFAULT_WAIT_MS.toString()
    )
    .on('--help', function () {
      console.log(`
Example:

> ./scripts/prune-pocket-access-tokens.sh
> ./scripts/prune-pocket-access-tokens.sh --dry-run=false --batch-size=500 --wait=2000

Exit Codes:
  0 - success
  1 - unexpected error
  2 - error during initialization`);
    })
    .parse(process.argv);

  const dryRun = program.dryRun !== 'false' && program.dryRun !== false;
  const batchSize = parseInt(program.batchSize) || DEFAULT_BATCH_SIZE;
  const waitMs = parseInt(program.wait) || DEFAULT_WAIT_MS;
  const sleep = () => new Promise((resolve) => setTimeout(resolve, waitMs));

  log.info('Pocket token pruning start', {
    dryRun,
    batchSize,
    waitMs,
    pocketClientIds: POCKET_CLIENT_IDS,
  });

  // Setup Knex Connection
  let db;
  try {
    db = setupDatabase({
      ...config.oauthServer.mysql,
    });

    // Binds knex once, which effectively binds for all BaseAuthModel inherited types
    BaseAuthModel.knex(db);
  } catch (err) {
    log.error('error during knex initialization', err);
    return 2;
  }

  try {
    for (const clientId of POCKET_CLIENT_IDS) {
      const clientIdBuffer = Buffer.from(clientId, 'hex');

      const countResult = await db('tokens')
        .where('clientId', clientIdBuffer)
        .count('* as total');
      const tokenCount = countResult[0].total;

      console.log(
        `Found ${tokenCount} Pocket access tokens for client ID ${clientId}.`
      );

      if (tokenCount === 0) {
        console.log(
          `No Pocket access tokens to delete for client ID ${clientId}.`
        );
      }

      if (dryRun) {
        console.log(
          'Dry run mode is on. It is the default; use --dry-run=false when you are ready.'
        );
      } else {
        // Delete the tokens in batches
        let totalDeleted = 0;
        let batchCount = 0;
        let deleteCount = 0;

        do {
          deleteCount = await db('tokens')
            .where('clientId', clientIdBuffer)
            .limit(batchSize)
            .del();

          if (deleteCount > 0) {
            totalDeleted += deleteCount;
            batchCount++;

            log.info('Deleted batch of Pocket tokens', {
              clientId,
              batchNumber: batchCount,
              batchDeleteCount: deleteCount,
              totalDeleted,
              remaining: tokenCount - totalDeleted,
            });

            statsd.increment('pocket_tokens_deleted', deleteCount, {
              client_id: clientId,
            });

            // Don't sleep after the last batch
            if (deleteCount === batchSize) {
              await sleep();
            }
          }
        } while (deleteCount > 0);

        log.info('Deleted all pocket tokens for client', {
          clientId,
          totalDeleted,
          batches: batchCount,
        });
      }
    }

    console.log('Pocket access token pruning complete!');
    return 0;
  } catch (err) {
    log.error('error during pocket token prune', err);
    return 1;
  } finally {
    if (db) {
      await db.destroy();
    }
  }
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((result) => {
      exitStatus = result;
    })
    .catch((err) => {
      console.error(err);
    })
    .then(() => {
      // Make sure statsd closes cleanly so we don't lose any metrics
      return new Promise((resolve) => {
        statsd.close((err) => {
          if (err) {
            log.warn('statsd', { closed: true, err });
          } else {
            log.info('statsd', { closed: true });
          }
          resolve(true);
        });
      });
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
