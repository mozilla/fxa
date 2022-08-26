/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import program from 'commander';
import { setupDatabase } from 'fxa-shared/db';
import { BaseAuthModel } from 'fxa-shared/db/models/auth';
import { StatsD } from 'hot-shots';
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

export async function init() {
  // Setup utilities
  const config = require('../config').getProperties();
  const statsd = new StatsD(config.statsd);
  const log = require('../lib/log')(config.log.level, 'prune-tokens', statsd);
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
      'Max age of token. Any tokens older than this value will be pruned. A value of 0 results in a no-op.',
      0
    )
    .option(
      '--maxCodeAge <duration>',
      'Max age of code. Any codes older than this value will be pruned. A value of 0 results in a no-op.',
      0
    )
    .option(
      '--maxSessions <number>',
      'Controls the maximum number of sessions allowed per account. A value of 0 results in a no-op.',
      0
    )
    .option(
      '--maxSessionsMaxAccounts <number>',
      'When maxSessions is greater than 0, this value allows us to limit scope of the delete by restricting the number of accounts processed on any given run. This generally be an order of magnitude smaller than maxAccountsConsidered.',
      100
    )
    .option(
      '--maxSessionsMaxDeletions <number>',
      'When maxSessions is greater than 0, this value restricts the total number of sessions that can be deleted.',
      100e3
    )
    .option(
      '--maxSessionsBatchSize <number>',
      'When maxSessions is greater than 0, this value controls the number of deletions that are batched together. By default, no more than 1000 session tokens will be deleted by anyone query.',
      1e3
    )
    .option('--wait', 'Amount of time to sleep between delete operations.', 5e3)
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
  const codeMaxAge = parseDuration(program.maxCodeAge);
  const maxSessions = program.maxSessions;
  const maxSessionsMaxAccounts = program.maxSessionsMaxAccounts;
  const maxSessionsBatchSize = program.maxSessionsBatchSize;
  const maxSessionsMaxDeletions = program.maxSessionsMaxDeletions;
  const wait = program.wait;
  const sleep = async () => new Promise((r) => setTimeout(r, wait));

  log.info('token pruning args', {
    maxTokenAge: program.maxTokenAge,
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
    // recursive function that prunes session tokens until all extraneous tokens have been removed or
    // number of deletions exceed max deletions.
    const limitSessions = async (
      account: string,
      deletions: number
    ): Promise<number> => {
      log.info('limit sessions start', {
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

      // Keeping looping until all extraneous sessions been cleaned up
      if (result.outputs['@totalDeletions'] <= 0) {
        return deletions;
      }

      deletions += result.outputs['@totalDeletions'];

      // Exit early and return the number of rows deleted.
      if (deletions > maxSessionsMaxDeletions) {
        log.info('hit max allowed deletions', { deletions });
        return deletions;
      }

      // Give process a break
      await sleep();
      return await limitSessions(account, deletions);
    };

    // Locate large accounts
    const targetAccounts = [];
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
        const deletions = await limitSessions(account, 0);

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
      const result = await pruner.prune(tokenMaxAge, codeMaxAge);
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

        // Pull session tokens from sql db.
        const sessionTokens = await SessionToken.findByUid(uid);
        const sqlSessionTokenIds = new Set(sessionTokens.map((x) => x.tokenId));

        // Sanity check size of sqlSessionTokenIds and redisSessionTokenIds
        if (maxSessions > 0 && sqlSessionTokenIds.size > maxSessions) {
          log.warn(
            `Found ${sqlSessionTokenIds.size}. Expected no more than ${maxSessions}.`
          );
        }
        if (redisSessionTokenIds.size > MAX_REDIS_SESSION_TOKENS) {
          log.warn(
            `found ${redisSessionTokenIds.size}. expected no more than ${MAX_REDIS_SESSION_TOKENS}.`
          );
        }

        // Difference redisSessionTokenIds and sqlSessionTokenIds. This will result in a
        // set of orphaned tokens.
        const difference = new Set(redisSessionTokenIds);
        for (const x of sqlSessionTokenIds) {
          difference.delete(x);
        }

        // Delete orphaned tokens from Redis
        const orphanedTokenIds = [...difference];
        if (orphanedTokenIds.length > 0) {
          log.info(`pruning orphaned tokens from redis`, {
            uid,
            count: orphanedTokenIds.length,
          });
          await redis.pruneSessionTokens(uid, orphanedTokenIds);
        } else {
          log.info(`no orphaned tokens found in redis`);
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
  let exitStatus = 1;
  init()
    .then((result) => {
      exitStatus = result;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
