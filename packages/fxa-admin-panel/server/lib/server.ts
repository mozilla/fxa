/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import express from 'express';
import path from 'path';
import serveStatic from 'serve-static';
import helmet from 'helmet';
import config from '../config';
import { noRobots } from './no-robots';
import log from './logging';

const logger = log('server.main');
const proxyUrl = config.get('proxyStaticResourcesFrom');

const app = express();

// TO DO: CSP, CORS, other security-related tasks (#4312)

app.use(
  helmet.frameguard({
    action: 'deny',
  }),
  helmet.xssFilter(),
  helmet.noSniff(),
  noRobots as express.RequestHandler
);

app.disable('x-powered-by');

const hstsEnabled = config.get('hstsEnabled');
if (hstsEnabled) {
  app.use(
    helmet.hsts({
      force: true,
      includeSubDomains: true,
      maxAge: config.get('hstsMaxAge'),
    })
  );
}

// Note - the static route handlers must come last
// because the proxyUrl handler's app.use('/') captures
// all requests that match no others.
if (proxyUrl) {
  logger.info('static.proxying', { url: proxyUrl });
  const proxy = require('express-http-proxy');
  app.use('/', proxy(proxyUrl));
} else {
  const STATIC_DIRECTORY = path.join(
    __dirname,
    '..',
    '..',
    config.get('staticResources.directory')
  );

  logger.info('static.directory', { directory: STATIC_DIRECTORY });
  app.use(
    serveStatic(STATIC_DIRECTORY, {
      maxAge: config.get('staticResources.maxAge'),
    })
  );
}

export async function createServer() {
  const port = config.get('listen.port');
  const host = config.get('listen.host');
  logger.info('server.starting', { port });
  app.listen(port, host, error => {
    if (error) {
      logger.error('server.start.error', { error });
      return;
    }

    logger.info('server.started', { port });
  });
}
