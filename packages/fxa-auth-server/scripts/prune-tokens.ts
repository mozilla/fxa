/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import program from 'commander';
import { setupDatabase } from 'fxa-shared/db';
import { BaseAuthModel } from 'fxa-shared/db/models/auth';
import { StatsD } from 'hot-shots';
import { knex } from 'knex';
import moment from 'moment';
const { PruneTokens } = require('fxa-shared/db/models/auth');
const pckg = require('../package.json');

/** Wrapper around moment to parse input args coming in as duration strings */
function parseDuration(duration: string) {
  return moment.duration(...duration.split(/\s|-/)).asMilliseconds();
}

export async function init() {
  // Setup utilities
  const config = require('../config').getProperties();
  const statsd = new StatsD(config.statsd);
  const log = require('../lib/log')(config.log.level, 'prune-tokens', statsd);

  // Parse args
  program
    .version(pckg.version)
    .option(
      '--maxTokenAge <duration>',
      'Max age of token. Any tokens older than this value will be pruned.',
      '10 days'
    )
    .option(
      '--maxCodeAge <duration>',
      'Max age of code. Any codes older than this value will be pruned.',
      '1 month'
    )
    .on('--help', function () {
      console.log(`
Example:

> ./scripts/prune-tokens.sh --maxTokenAge='10 days' --maxCodeAge='1 month'

Exit Codes:
  0 - success
  1 - unexpected error
  2 - error during initialization
  3 - error during pruning operation`);
    })
    .parse(process.argv);

  const tokenMaxAge = parseDuration(program.maxTokenAge);
  const codeMaxAge = parseDuration(program.maxCodeAge);

  log.info('token pruning args', {
    maxTokenAge: program.maxTokenAge,
    maxCodeAge: program.maxCodeAge,
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

  // Start pruning operation
  try {
    log.info('token pruning start', {
      tokenMaxAge: tokenMaxAge + 'ms',
      codeMaxAge: codeMaxAge + 'ms',
    });
    const pruner = new PruneTokens(0, statsd, log);
    const result = await pruner.prune(tokenMaxAge, codeMaxAge);
    log.info('token pruning complete', result);
  } catch (err) {
    log.error('error during prune', err);
    return 3;
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
