/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = () => {
  const path = require('path');
  const fs = require('fs');

  // setup version first for the rest of the modules
  const log = require('./logging/log');
  const logger = log('server.main');
  const version = require('./version');
  const config = require('../config');

  logger.info(`source set to: ${version.source}`);
  logger.info(`version set to: ${version.version}`);
  logger.info(`commit hash set to: ${version.commit}`);

  const express = require('express');
  const helmet = require('helmet');
  const sentry = require('@sentry/node');
  const serveStatic = require('serve-static');

  const bodyParser = require('body-parser');
  const csp = require('../lib/csp');
  const cspRulesBlocking = require('../lib/csp/blocking')(config);
  const cspRulesReportOnly = require('../lib/csp/report-only')(config);
  const { cors, routing } = require('../../../fxa-shared/express')();

  const NOOP = () => {};
  const StatsD = require('hot-shots');
  const statsdConfig = config.get('statsd');
  const statsd = statsdConfig.enabled
    ? new StatsD({
        ...statsdConfig,
        errorHandler: err => {
          // eslint-disable-next-line no-use-before-define
          logger.error('statsd.error', err);
        },
      })
    : {
        timing: NOOP,
      };

  const routes = require('./routes')(statsd);

  const app = express();

  // Each of these config values (e.g., 'servers.content') will be exposed as the given
  // variable to the client/browser (via fxa-content-server/config)
  const CLIENT_CONFIG = {
    env: config.get('env'),
    legalDocLinks: {
      privacyNotice: config.get('legalDocLinks.privacyNotice'),
      termsOfService: config.get('legalDocLinks.termsOfService'),
    },
    productRedirectURLs: config.get('productRedirectURLs'),
    sentry: {
      dsn: config.get('sentry.dsn'),
      url: config.get('sentry.url'),
    },
    servers: {
      auth: {
        url: config.get('servers.auth.url'),
      },
      content: {
        url: config.get('servers.content.url'),
      },
      oauth: {
        url: config.get('servers.oauth.url'),
      },
      profile: {
        url: config.get('servers.profile.url'),
      },
      surveyGizmo: {
        url: config.get('servers.surveyGizmo.url'),
      },
    },
    stripe: {
      apiKey: config.get('stripe.apiKey'),
    },
    version: version.version,
  };

  // This is a list of all the paths that should resolve to index.html:
  const INDEX_ROUTES = ['/', '/subscriptions', '/products/:productId'];

  app.disable('x-powered-by');

  const sentryDSN = config.get('sentry.dsn');
  if (sentryDSN) {
    sentry.init({ dsn: sentryDSN });
    app.use(sentry.Handlers.requestHandler());
  }

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

  app.use(
    // Side effect - Adds default_fxa and dev_fxa to express.logger formats
    require('./logging/route-logging')(),

    helmet.frameguard({
      action: 'deny',
    }),

    helmet.xssFilter(),

    helmet.noSniff(),

    require('./no-robots'),

    bodyParser.text({
      type: 'text/plain',
    }),

    bodyParser.json({
      // the 3 entries:
      // json file types,
      // all json content-types
      // csp reports
      type: ['json', '*/json', 'application/csp-report'],
    })
  );

  if (config.get('csp.enabled')) {
    app.use(csp({ rules: cspRulesBlocking }));
  }
  if (config.get('csp.reportOnlyEnabled')) {
    // There has to be more than a `reportUri`
    // to enable reportOnly CSP.
    if (Object.keys(cspRulesReportOnly.directives).length > 1) {
      app.use(csp({ rules: cspRulesReportOnly }));
    }
  }

  if (isCorsRequired()) {
    // JS, CSS and web font resources served from a CDN
    // will be ignored unless CORS headers are present.
    const corsOptions = {
      origin: config.get('listen.publicUrl'),
    };

    app.route(/\.(js|css|woff|woff2|eot|ttf)$/).get(cors(corsOptions));
  }

  const routeHelpers = routing(app, logger);
  routes.forEach(routeHelpers.addRoute);

  app.get('/__lbheartbeat__', (req, res) => {
    res.type('txt').send('Ok');
  });

  app.get('/__version__', (req, res) => {
    res.type('application/json').send(JSON.stringify(version));
  });

  function injectMetaContent(html, metaContent = {}) {
    let result = html;

    Object.keys(metaContent).forEach(k => {
      result = result.replace(
        k,
        encodeURIComponent(JSON.stringify(metaContent[k]))
      );
    });

    return result;
  }

  function injectHtmlConfig(html, config, featureFlags = {}) {
    return injectMetaContent(html, {
      __SERVER_CONFIG__: config,
      __FEATURE_FLAGS__: featureFlags,
    });
  }

  // Note - the static route handlers must come last
  // because the proxyUrl handler's app.use('/') captures
  // all requests that match no others.
  const proxyUrl = config.get('proxyStaticResourcesFrom');

  if (proxyUrl) {
    logger.info('static.proxying', { url: proxyUrl });
    const proxy = require('express-http-proxy');
    app.use(
      '/',
      proxy(proxyUrl, {
        userResDecorator: function(
          proxyRes,
          proxyResData,
          userReq /*, userRes*/
        ) {
          const contentType = proxyRes.headers['content-type'];
          if (!contentType || !contentType.startsWith('text/html')) {
            return proxyResData;
          }
          if (userReq.url.startsWith('/sockjs-node/')) {
            // This is a development WebPack channel that we don't want to modify
            return proxyResData;
          }
          const body = proxyResData.toString('utf8');
          return injectHtmlConfig(body, CLIENT_CONFIG, {});
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

    logger.info('static.directory', { directory: STATIC_DIRECTORY });

    const STATIC_INDEX_HTML = fs.readFileSync(
      path.join(STATIC_DIRECTORY, 'index.html'),
      { encoding: 'UTF-8' }
    );

    INDEX_ROUTES.forEach(route => {
      // FIXME: should set ETag, Not-Modified:
      app.get(route, (req, res) => {
        res.send(injectHtmlConfig(STATIC_INDEX_HTML, CLIENT_CONFIG, {}));
      });
    });

    app.use(
      serveStatic(STATIC_DIRECTORY, {
        maxAge: config.get('staticResources.maxAge'),
      })
    );
  }

  // it's a four-oh-four not found.
  app.use(require('./404'));

  app.use(routeHelpers.validationErrorHandler);

  if (sentryDSN) {
    app.use(sentry.Handlers.errorHandler());
  }

  return {
    listen,
    app, // for testing
  };

  function isCorsRequired() {
    return config.get('staticResources.url') !== config.get('listen.publicUrl');
  }

  function listen() {
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
};
