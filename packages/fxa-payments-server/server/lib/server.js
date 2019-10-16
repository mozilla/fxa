/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = () => {
  const path = require('path');
  const fs = require('fs');
  const {
    celebrate,
    isCelebrate: isValidationError,
    errors: validationErrorHandlerFactory,
  } = require('celebrate');
  const cors = require('cors');

  // setup version first for the rest of the modules
  const logger = require('./logging/log')('server.main');
  const routes = require('./routes');
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

  const app = express();

  // Each of these config values (e.g., 'servers.content') will be exposed as the given
  // variable to the client/browser (via fxa-content-server/config)
  const CLIENT_CONFIG = {
    productRedirectURLs: config.get('productRedirectURLs'),
    sentryDsn: config.get('sentryDsn'),
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
    },
    stripe: {
      apiKey: config.get('stripe.apiKey'),
    },
    legalDocLinks: {
      privacyNotice: config.get('legalDocLinks.privacyNotice'),
      termsOfService: config.get('legalDocLinks.termsOfService'),
    },
  };

  // This is a list of all the paths that should resolve to index.html:
  const INDEX_ROUTES = ['/', '/subscriptions', '/products/:productId'];

  app.disable('x-powered-by');

  const sentryDsn = config.get('sentryDsn');
  if (sentryDsn) {
    sentry.init({ dsn: sentryDsn });
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

  routes.forEach(route => {
    if (!isValidRoute(route)) {
      return logger.error('route definition invalid: ', route);
    }

    // Build a list of route handlers.
    // `cors`, preProcess` and `validate` are optional.
    const routeHandlers = [];

    // Enable CORS using https://github.com/expressjs/cors
    // If defined, `cors` can be truthy or an object.
    // Objects are passed to the middleware directly.
    // Other truthy values use the default configuration.
    if (route.cors) {
      const corsConfig =
        typeof route.cors === 'object' ? route.cors : undefined;
      // Enable the pre-flight OPTIONS request
      app.options(route.path, cors(corsConfig));
      routeHandlers.push(cors(corsConfig));
    }

    if (route.preProcess) {
      routeHandlers.push(route.preProcess);
    }

    if (route.validate) {
      routeHandlers.push(
        celebrate(route.validate, {
          // silently drop any unknown fields within objects on the ground.
          stripUnknown: { arrays: false, objects: true },
        })
      );
    }

    routeHandlers.push(route.process);
    app[route.method].apply(app, [route.path].concat(routeHandlers));
  });

  app.get('/__lbheartbeat__', (req, res) => {
    res.type('txt').send('Ok');
  });

  app.get('/__version__', (req, res) => {
    res.type('application/json').send(JSON.stringify(version));
  });

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

    const renderedStaticHtml = injectHtmlConfig(
      STATIC_INDEX_HTML,
      CLIENT_CONFIG,
      {}
    );
    INDEX_ROUTES.forEach(route => {
      // FIXME: should set ETag, Not-Modified:
      app.get(route, (req, res) => {
        res.send(renderedStaticHtml);
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

  const validationErrorHandler = validationErrorHandlerFactory();
  app.use((err, req, res, next) => {
    if (err && isValidationError(err)) {
      logger.error('validation.failed', {
        err,
        method: req.method,
        path: req.url,
      });
      validationErrorHandler(err, req, res, next);
    } else {
      // not a validation error, send to the next error handler
      next(err);
    }
  });

  if (sentryDsn) {
    app.use(sentry.Handlers.errorHandler());
  }

  return {
    listen,
    app, // for testing
  };

  function isCorsRequired() {
    return config.get('staticResources.url') !== config.get('listen.publicUrl');
  }

  function injectHtmlConfig(html, config, featureFlags) {
    const encodedConfig = encodeURIComponent(JSON.stringify(config));
    let result = html.replace('__SERVER_CONFIG__', encodedConfig);
    const encodedFeatureFlags = encodeURIComponent(
      JSON.stringify(featureFlags)
    );
    result = result.replace('__FEATURE_FLAGS__', encodedFeatureFlags);
    return result;
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

  /**
   * Each route has 3 attributes: `method`, `path` and `process`.
   * `method` is one of `GET`, `POST`, etc.
   * `path` is a string or regular expression that express uses to match a route.
   * `process` is a function that is called with req and res to handle the route.
   *
   * Each route can have 2 additional attributes: `preProcess` and `validate`.
   * `preProcess` is a function that is called with `req`, `res`, and `next`.
   *   Use to do any pre-processing before validation, such as converting from text to JSON.
   * `validate` is where to declare JOI validation. Follows
   *   [celebrate](https://www.npmjs.com/package/celebrate) conventions.
   */
  function isValidRoute(route) {
    return !!route.method && route.path && route.process;
  }
};
