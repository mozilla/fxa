/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Primary entry point for running the support panel in production.
 *
 * @module
 */
import redis from 'fxa-shared/redis';
import mozlog from 'mozlog';

import Config from '../config';
import { init, ServerEnvironment } from '../lib/server';

const logger = mozlog(Config.get('logging'))('supportPanel');
const redisConfig = Config.get('redis');
const redisHandle = redis(
  {
    host: redisConfig.host,
    port: redisConfig.port,
    ...redisConfig.sessionTokens,
  },
  logger
);

async function main() {
  const server = await init(
    { ...Config.getProperties(), env: Config.get('env') as ServerEnvironment },
    logger,
    redisHandle
  );

  try {
    logger.info('startup', { message: 'Starting support-panel ...' });
    await server.start();
  } catch (err) {
    logger.error('startup', { err });
    process.exit(1);
  }

  process.on('uncaughtException', err => {
    logger.error('uncaughtException', { err });
    process.exit(8);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('unhandledRejection', { error: reason });
    process.exit();
  });
  process.on('SIGINT', shutdown);

  function shutdown() {
    server.stop({ timeout: 10_000 }).then(() => {
      process.exit(0);
    });
  }
}

main();
