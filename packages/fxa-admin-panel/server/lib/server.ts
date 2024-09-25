/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TO DO: CORS, other security-related tasks (#4312)
import * as Sentry from '@sentry/node';

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import serveStatic from 'serve-static';
import helmet from 'helmet';
import version from './version';
import config from '../config';
import fs from 'fs';
import { noRobots } from './no-robots';
import log from './logging';
import csp from '../lib/csp';
import cspBlocking from '../lib/csp/blocking';
import cspReportOnly from '../lib/csp/report-only';
import { ClientConfig } from './client-config';

const app = express();
const logger = log('server.main');
const proxyUrl = config.get('proxyStaticResourcesFrom');
const cspRulesBlocking = cspBlocking(config);
const cspRulesReportOnly = cspReportOnly(config);

logger.info('version', { version: version });

// Initialize Sentry
const sentryConfig = config.get('sentry');

app.use(
  helmet.frameguard({
    action: 'deny',
  }),
  // As of Helmet v4 xssFilter() now sets this header value to `0`,
  // which disables XSS Filtering altogether. We want it enabled.
  // More info: https://github.com/helmetjs/helmet/issues/230
  (req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  },
  helmet.noSniff(),
  helmet.referrerPolicy({ policy: 'same-origin' }),
  noRobots as express.RequestHandler,
  bodyParser.text({
    type: 'text/plain',
  }),
  bodyParser.json({
    type: ['json', '*/json', 'application/csp-report'],
  })
);

if (config.get('csp.enabled')) {
  app.use(csp({ rules: cspRulesBlocking }) as express.RequestHandler);
}

if (config.get('csp.reportOnlyEnabled')) {
  // There has to be more than a `reportUri`
  // to enable reportOnly CSP.
  if (Object.keys(cspRulesReportOnly.directives).length > 1) {
    app.use(csp({ rules: cspRulesReportOnly }) as express.RequestHandler);
  }
}

app.disable('x-powered-by');

const hstsEnabled = config.get('hstsEnabled');
if (hstsEnabled) {
  app.use(
    helmet.hsts({
      includeSubDomains: true,
      maxAge: config.get('hstsMaxAge'),
    })
  );
}

app.get('/__lbheartbeat__', (_, res) => res.type('txt').send('Ok'));

app.get('/__version__', (_, res) =>
  res.type('application/json').send(JSON.stringify(version))
);

// Note - the static route handlers must come last
// because the proxyUrl handler's app.use('/') captures
// all requests that match no others.
if (proxyUrl) {
  logger.info('static.proxying', { url: proxyUrl });
  const proxy = require('express-http-proxy');
  app.use(
    '/',
    proxy(proxyUrl, {
      userResDecorator: function (
        proxyRes: Request,
        proxyResData: Response,
        userReq: Request
      ) {
        const contentType = proxyRes.headers['content-type'];
        if (!contentType || !contentType.startsWith('text/html')) {
          return proxyResData;
        }
        if (userReq.url.startsWith('/sockjs-node/')) {
          // This is a development WebPack channel that we don't want to modify
          return proxyResData;
        }
        const body = proxyResData.toString();
        return ClientConfig.injectIntoHtml(body, userReq.headers);
      },
    })
  );
} else {
  const STATIC_DIRECTORY = path.join(
    __dirname,
    '..',
    '..',
    config.get('staticResources.directory')
  );

  const STATIC_INDEX_HTML = fs.readFileSync(
    path.join(STATIC_DIRECTORY, 'index.html'),
    { encoding: 'utf-8' }
  );

  ['/', '/account-search', '/relying-parties', '/permissions'].forEach(
    (route) => {
      // FIXME: should set ETag, Not-Modified:
      app.get(route, (req, res) => {
        res.send(ClientConfig.injectIntoHtml(STATIC_INDEX_HTML, req.headers));
      });
    }
  );

  logger.info('static.directory', { directory: STATIC_DIRECTORY });
  app.use(
    serveStatic(STATIC_DIRECTORY, {
      maxAge: config.get('staticResources.maxAge'),
    })
  );
}

// Send errors to sentry.
if (sentryConfig.dsn) {
  Sentry.setupExpressErrorHandler(app);
}

export default app;

export async function createServer() {
  const port = config.get('listen.port');
  const host = config.get('listen.host');
  logger.info('server.starting', { port });
  app.listen(port, host, () => {
    logger.info('server.started', { port });
  });
}
