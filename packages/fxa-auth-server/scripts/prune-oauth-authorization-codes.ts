/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import program from 'commander';
import { StatsD } from 'hot-shots';
import { promisify } from 'util';
const pckg = require('../package.json');
const DEFAULT_TTL_MS = 900000;

export async function init() {
  // Setup utilities
  const config = require('../config').getProperties();
  const statsd = new StatsD({ ...config.statsd, maxBufferSize: 0 });
  const log = require('../lib/log')(
    config.log.level,
    'prune-oauth-codes',
    statsd
  );
  const oauthDb = require('../lib/oauth/db');

  // Parse args
  program
    .version(pckg.version)
    .option(
      '--ttl <number>',
      'The TTL of OAuth authorization codes in milliseconds.  Defaults to 15 minutes.',
      DEFAULT_TTL_MS.toString()
    )
    .on('--help', () =>
      console.log('\n\nPrunes up to 10000 expired OAuth authorization codes.')
    )
    .parse(process.argv);

  const ttlInMs = parseInt(program.ttl) || DEFAULT_TTL_MS;

  log.info('OAuth codes pruning', { ttl: ttlInMs });

  try {
    log.info('OAuth codes pruning start', { ttl: ttlInMs });
    const result = await oauthDb.pruneAuthorizationCodes(ttlInMs);
    statsd.increment('oauth-codes.pruned', result.pruned);
    log.info('token pruning complete', result);
  } catch (err) {
    log.error('error during prune', err);
    return 1;
  }

  await promisify(statsd.close).bind(statsd)();
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
