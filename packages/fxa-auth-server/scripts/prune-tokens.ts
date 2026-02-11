/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import program from 'commander';
import { setupDatabase } from 'fxa-shared/db';
import { BaseAuthModel } from 'fxa-shared/db/models/auth';
import { StatsD } from 'hot-shots';
import * as Sentry from '@sentry/node';
import moment from 'moment';
import { SessionToken } from 'fxa-shared/db/models/auth/session-token';
const { PruneTokens } = require('fxa-shared/db/models/auth');
const pckg = require('../package.json');

// Max number anticipated redis session tokens
const MAX_REDIS_SESSION_TOKENS = 500;

/** Wrapper around moment to parse input args coming in as duration strings */
function parseDuration(duration: string | number) {
  if (typeof duration === 'number') {
    return duration;
  }

  return moment.duration(...duration.split(/\s|-/)).asMilliseconds();
}

const config = require('../config').default.getProperties();
const statsd = new StatsD(config.statsd);
const log = require('../lib/log')(config.log.level, 'prune-tokens', statsd);
Sentry.init({});

export async function init() {
  // Setup utilities
  const redis = require('../lib/redis')(
    {
      ...config.redis,
      ...config.redis.sessionTokens,
    },
    log
  );

  // Parse args
  program
    .version(pckg.version)
    .option(
      '--maxTokenAge <duration>',
      'Max age of token. Any tokens older than this value will be pruned, except session tokens with associated devices. A value of 0 results in a no-op.',
      '0'
    )
    .option(
      '--maxTokenAgeWindowSize <number>',
      'The number of tokens to consider when pruning. This applies specifically to session tokens and has a limiting effect on the query. Increasing value will pull in more tokens for deletion.',
      100000
    )
    .option(
      '--maxCodeAge <duration>',
      'Max age of code. Any codes older than this value will be pruned. A value of 0 results in a no-op.',
      '0'
    )
    .option(
      '--maxSessions <number>',
      'Max number of sessions that any account is allowed to hold. A value of 0 results in a no-op.',
      '0'
    )
    .option(
      '--maxSessionsMaxAccounts <number>',
      'When maxSessions is greater than 0 this is the upper limit of accounts processed per run.',
      100
    )
    .option(
      '--maxSessionsMaxDeletions <number>',
      'When maxSessions is greater than 0, this is the upper limit of tokens deleted per account before moving to the next account.',
      100e3
    )
    .option(
      '--maxSessionsBatchSize <number>',
      'When maxSessions is greater than 0, this value controls the number of deletions that are batched together at one time. e.g. A batch size of 1 would delete one token at a time.',
      1e3
    )
    .option(
      '--wait <number>',
      'Amount of time to sleep in milliseconds between batches (i.e. between deletions).',
      5e3
    )
    .on('--help', function () {
      console.log(`
Example:

> ./scripts/prune-tokens.sh --maxTokenAge='10 days' --maxCodeAge='1 month' --maxSessions=500

Exit Codes:
  0 - success
  1 - unexpected error
  2 - error during initialization
  3 - error during pruning operation`);
    })
    .parse(process.argv);

  const tokenMaxAge = parseDuration(program.maxTokenAge);
  const maxTokenAgeWindowSize = program.maxTokenAgeWindowSize;
  const codeMaxAge = parseDuration(program.maxCodeAge);
  const maxSessions = program.maxSessions;
  const maxSessionsMaxAccounts = program.maxSessionsMaxAccounts;
  const maxSessionsBatchSize = program.maxSessionsBatchSize;
  const maxSessionsMaxDeletions = program.maxSessionsMaxDeletions;
  const wait = program.wait;
  const sleep = async () => new Promise((r) => setTimeout(r, wait));

  log.info('token pruning args', {
    maxTokenAge: program.maxTokenAge,
    maxTokenAgeWindowSize: maxTokenAgeWindowSize,
    maxCodeAge: program.maxCodeAge,
    maxSessions,
    maxSessionsMaxAccounts,
    maxSessionsBatchSize,
    maxSessionsMaxDeletions,
    wait,
  });

  // Setup Knex Connection. PruneTokens relies on this being done.
  try {
    const db = setupDatabase({
      ...config.database.mysql.auth,
    });

    // Binds knex once, which effectively binds for all BaseAuthModel inherited types
    BaseAuthModel.knex(db);
  } catch (err) {
    log.error('error during knex initialization', err);
    return 2;
  }

  // Create token pruner instance
  const pruner = new PruneTokens(statsd, log);
  const accountsImpacted = new Set<string>();

  // Start max session pruning
  if (maxSessions > 0) {
    // Locate large accounts
    const targetAccounts = new Array<string>();
    try {
      log.info('finding large accounts', {
        maxSessions,
        maxAccountsProcessed: maxSessionsMaxAccounts,
      });

      const result = await pruner.findLargeAccounts(
        maxSessions,
        maxSessionsMaxAccounts
      );

      for (const row of result || []) {
        const uid = row.uid.toString('hex');
        targetAccounts.push(uid);
      }

      log.info('found large accounts', targetAccounts);
    } catch (err) {
      log.error('error while finding large accounts', err);
      return 2;
    }

    // Loop over target accounts and start deleting sessions
    for (const account of targetAccounts) {
      try {
        let deletions = 0;
        while (deletions < maxSessionsMaxDeletions) {
          log.info('calling limitSessions', {
            maxSessions,
            account,
            maxSessionsDeleted: maxSessionsBatchSize,
          });

          // Make the DB call limiting the next 'maxSessionsDeleted'
          const result = await pruner.limitSessions(
            account,
            maxSessions,
            maxSessionsBatchSize
          );

          const currentDeletions = result.outputs['@totalDeletions'];
          log.info('limitSessions result', { currentDeletions });

          // Keeping looping until all extraneous sessions been cleaned up
          if (currentDeletions <= 0) {
            break;
          }

          deletions += result.outputs['@totalDeletions'];

          // Give process a break
          await sleep();
        }

        // Exit early and return the number of rows deleted.
        if (deletions >= maxSessionsMaxDeletions) {
          log.info('hit max allowed deletions', { deletions });
        }

        // If there were session tokens deleted, take note of the account for clean up later.
        if (deletions > 0) {
          accountsImpacted.add(account);
        }

        log.info(`limit sessions complete`, { deletions });
      } catch (err) {
        log.error('error during limit sessions', err);
        return 2;
      }
    }
  } else {
    log.info(
      'skipping limit sessions operation. maxSessions not defined or set to 0'
    );
  }

  // Start pruning operation
  if (tokenMaxAge > 0 || codeMaxAge > 0) {
    try {
      log.info('token pruning start', {
        tokenMaxAge: tokenMaxAge + 'ms',
        codeMaxAge: codeMaxAge + 'ms',
      });
      const result = await pruner.prune(
        tokenMaxAge,
        codeMaxAge,
        maxTokenAgeWindowSize
      );
      log.info('token pruning complete', result.outputs);

      for (const row of result.uids || []) {
        const uid = row.uid.toString('hex');
        accountsImpacted.add(uid);
      }
    } catch (err) {
      log.error('error during token prune', err);
      return 3;
    }
  } else {
    log.info(
      'skipping token pruning operation. tokenMaxAge and codeMaxAge are both 0.'
    );
  }

  // Clean up redis cache
  if (accountsImpacted.size > 0) {
    for (const uid of accountsImpacted) {
      try {
        // Pull session tokens from redis, sanity check sizes
        const redisSessionTokens = await redis.getSessionTokens(uid);
        const redisSessionTokenIds = new Set(
          Object.keys(redisSessionTokens || {})
        );

        // Short circuit if there are no redis session tokens
        if (redisSessionTokenIds.size === 0) {
          log.info('no tokens found in redis cache', { uid });
          continue;
        }

        if (redisSessionTokenIds.size > MAX_REDIS_SESSION_TOKENS) {
          log.warn(
            `found ${redisSessionTokenIds.size}. expected no more than ${MAX_REDIS_SESSION_TOKENS}.`
          );
        }

        log.info(`processing ${redisSessionTokenIds.size} for account ${uid}.`);

        // Iterate through current set of redis tokens, and remove any that
        // don't exist in the sql database anymore.
        const orphanedTokens = new Array<string>();
        for (const redisSessionTokenId of redisSessionTokenIds) {
          const dbSessionTokens = await SessionToken.findByTokenId(
            redisSessionTokenId
          );
          if (dbSessionTokens === null) {
            orphanedTokens.push(redisSessionTokenId);
          }
        }

        if (orphanedTokens.length > 0) {
          log.info(
            `pruning orphaned sessions in redis. tokenCount=${orphanedTokens.length}`
          );
          await redis.pruneSessionTokens(uid, orphanedTokens);
        }
      } catch (err) {
        log.err(`error while pruning redis cache for account ${uid}`, err);
      }
    }
  } else {
    log.info('no accounts impacted. skipping redis cache clean up.');
  }

  return 0;
}

if (require.main === module) {
  process.on('exit', (code) => {
    log.info('exit', { code });
  });

  const checkInId = Sentry.captureCheckIn({
    monitorSlug: 'prune-tokens',
    status: 'in_progress',
  });

  init()
    .then((result) => {
      log.info('result', { result });
      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: 'prune-tokens',
        status: 'ok',
      });
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
    .catch((err) => {
      log.error(err);
      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: 'prune-tokens',
        status: 'error',
      });
    })
    .then(() => {
      return Sentry.close(2000);
    })
    .finally(() => {
      process.exit();
    });
}
