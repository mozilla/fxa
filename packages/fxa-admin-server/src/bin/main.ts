/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import mozlog from 'mozlog';

import Config from '../config';
import { configureSentry } from '../lib/sentry';
import { createServer } from '../lib/server';
import { version } from '../lib/version';

const logger = mozlog(Config.get('logging'))('supportPanel');
configureSentry({ dsn: Config.getProperties().sentryDsn, release: version.version });

async function run() {
  const server = await createServer(Config.getProperties(), logger, undefined);
  const { url } = await server.listen(8090);
  logger.info('startup', { message: `Server is running, GraphQL Playground available at ${url}` });
}

run().catch(err => {
  logger.error('startup', { err });
});
