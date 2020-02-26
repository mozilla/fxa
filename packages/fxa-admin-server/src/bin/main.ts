/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import mozlog from 'mozlog';
import Config from '../config';
import { createServer } from '../lib/server';

const logger = mozlog(Config.get('logging'))('supportPanel');

async function run() {
  const server = await createServer(Config.getProperties(), logger);
  const { url } = await server.listen(8090);
  logger.info('startup', { message: `Server is running, GraphQL Playground available at ${url}` });
}

run().catch(err => {
  logger.error('startup', { err });
});
