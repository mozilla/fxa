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
      '0'
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

  log.info('token pruning args', {
    maxTokenAge: program.maxTokenAge,
    maxCodeAge: program.maxCodeAge,
    maxSessions,
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
    try {
      log.info('limit sessions start', {
        maxSessions,
      });

      const result = await pruner.limitSessions(maxSessions);
      log.info('limit sessions complete', result.outputs);

      // Any account impacted by the prune operation should have it's session tokens cleaned out
      // of the redis cache.
      for (const row of result.uids || []) {
        const uid = row.uid.toString('hex');
        accountsImpacted.add(uid);
      }
    } catch (err) {
      log.error('error during limit sessions', err);
      return 3;
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
