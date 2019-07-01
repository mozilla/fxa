#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This is a command line tool that can be used to purge expired tokens
 * from the OAuth database. It requires you specify a pocket client id
 * before running. Currently, access tokens created from pocket should
 * not be deleted even if expired.
 *
 * Example usage:
 *
 * node purge_expired_tokens.js --config dev --pocket-id dcdb5ae7add825d2 --token-count 10000 --delay-seconds 1
 *
 * or, for multiple pocket ids:
 *
 * node purge_expired_tokens.js --config dev --pocket-id dcdb5ae7add825d2,678f75ae1c0f8002 --token-count 10000 --delay-seconds 1
 *
 * */

const config = require('../lib/config');
const package = require('../../package.json');
const program = require('commander');

const DB_GET_LOCK_STRING = 'purge_expired_tokens.lock';
const DB_GET_LOCK_TIMEOUT = 3;

// Don't bother updating the clients table.
config.set('db.autoUpdateClients', false);

program
  .version(package.version)
  .option('-c, --config [config]', 'Configuration to use. Ex. dev')
  .option(
    '-p, --pocket-id <pocketId>',
    'Pocket Client Ids. These tokens will not be purged. (CSV)'
  )
  .option('-t, --token-count <tokenCount>', 'Total number of tokens to delete.')
  .option(
    '-d, --delay-seconds <delaySeconds>',
    'Delay (seconds) between each deletion round. (Default: 1 second)'
  )
  .option(
    '-I, --by-id',
    'Delete tokens by selecting, then deleting by primary id (Default: false)'
  )
  .option(
    '-D, --delete-batch-size <deleteBatchSize>',
    'Number of tokens to delete in each deletion round. (Default: 200)'
  )
  .parse(process.argv);

if (!program.config) {
  program.config = 'dev';
}

process.env.NODE_ENV = program.config;

const db = require('../lib/db');
const logger = require('../lib/logging')('bin.purge_expired_tokens');

if (!program.pocketId) {
  logger.error('invalid', { message: 'Required pocket client id!' });
  process.exit(1);
}

const numberOfTokens = parseInt(program.tokenCount) || 200;
const delaySeconds = Number(program.delaySeconds) || 1; // Default 1 seconds
const deleteBatchSize = Number(program.deleteBatchSize) || 200; // Default 200
// There may be more than one pocketId, so treat this as a comma-separated list.
const ignorePocketClientId = program.pocketId.toLowerCase().split(/\s*,\s*/g);

db.ping()
  .then(() => {
    // Only mysql impl supports token deletion at the moment
    if (!(db.purgeExpiredTokens && db.purgeExpiredTokensById)) {
      const message =
        'Unable to purge expired tokens, only available ' +
        'when using config with mysql database.';
      logger.info('skipping', { message: message });
      return;
    }

    // To reduce the risk of deleting pocket tokens, purgeExpiredTokens(ById?)
    // will ensure that the pocket-id passed in belongs to a client.
    const purgeMethod = program.byId
      ? db.purgeExpiredTokensById
      : db.purgeExpiredTokens;

    return db
      .getLock(DB_GET_LOCK_STRING, DB_GET_LOCK_TIMEOUT)
      .then(result => {
        logger.info('getLock', { result: result });

        if (result.acquired !== 1) {
          logger.error('getLock', {
            error: `Could not acquire cooperative lock '${DB_GET_LOCK_STRING}'`,
          });
          process.exit(1);
        }

        logger.info('deleting', {
          numberOfTokens: numberOfTokens,
          delaySeconds: delaySeconds,
          deleteBatchSize: deleteBatchSize,
          ignorePocketClientId: ignorePocketClientId,
        });

        return purgeMethod(
          numberOfTokens,
          delaySeconds,
          ignorePocketClientId,
          deleteBatchSize
        )
          .then(() => {
            logger.info('completed');
            process.exit(0);
          })
          .catch(err => {
            logger.error('error', err);
            process.exit(1);
          });
      })
      .catch(err => {
        logger.critical('db.getLock', err);
        process.exit(1);
      });
  })
  .catch(err => {
    logger.critical('db.ping', err);
    process.exit(1);
  });

process.on('uncaughtException', err => {
  logger.error('error', err);
  process.exit(2);
});
