#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// setup version first for the rest of the modules
const loggerFactory = require('../lib/logging/log');
const logger = loggerFactory('server.main');
const version = require('../lib/version');

logger.info(`source set to: ${version.source}`);
logger.info(`version set to: ${version.version}`);
logger.info(`commit hash set to: ${version.commit}`);
logger.info(`fxa-content-server-l10n commit hash set to: ${version.l10n}`);
const config = require('../lib/configuration');
const {
  addAllReactRoutesConditionally,
} = require('../lib/routes/react-app/add-routes');

const bodyParser = require('body-parser');
const consolidate = require('consolidate');
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const https = require('https');
const path = require('path');
const serveStatic = require('serve-static');

const sentry = require('../lib/sentry');
const statsd = require('../lib/statsd');
const { cors, routing } = require('fxa-shared/express').express();
const {
  createSettingsProxy,
  modifySettingsStatic,
} = require('../lib/beta-settings');

const userAgent = require('fxa-shared/lib/user-agent').default;
if (!userAgent.isToVersionStringSupported()) {
  // npm@3 installs the incorrect version of node-uap, one without `toVersionString`.
  // To ensure the correct version is installed, check toVersionString is available.
  logger.critical('dependency.version.error', {
    error: 'node-uap does not support toVersionString()',
  });
  process.exit(1);
}

const isMain = require.main === module;
if (isMain) {
  // ./server is our current working directory
  process.chdir(path.dirname(__dirname));
}

const i18n = require('../lib/i18n')(config.get('i18n'));

// Side effect - Adds default_fxa and dev_fxa to express.logger formats
const routeLogging = require('../lib/logging/route_logging');

const noindex = require('../lib/noindex');
const fourOhFour = require('../lib/404');
const serverErrorHandler = require('../lib/500');
const localizedRender = require('../lib/localized-render');
const csp = require('../lib/csp');
const { tryCaptureValidationError } = require('../lib/sentry');
const cspRulesBlocking = require('../lib/csp/blocking')(config);
const cspRulesReportOnly = require('../lib/csp/report-only')(config);
const glean = require('../lib/glean')(config.getProperties());

const STATIC_DIRECTORY = path.join(
  __dirname,
  '..',
  '..',
  config.get('static_directory')
);

const PAGE_TEMPLATE_DIRECTORY = path.join(
  config.get('page_template_root'),
  config.get('page_template_subdirectory')
);

logger.info('page_template_directory: %s', PAGE_TEMPLATE_DIRECTORY);

function makeApp() {
  const app = express();
  const settingsPath = '/settings';

  if (config.get('env') === 'development') {
    const webpack = require('webpack');
    const webpackConfig = require('../../webpack.config.js');
    const webpackMiddleware = require('webpack-dev-middleware');
    const webpackCompiler = webpack(webpackConfig);

    app.use(
      webpackMiddleware(webpackCompiler, {
        publicPath: '/bundle/',
        writeToDisk: true,
      })
    );
  }

  app.engine('html', consolidate.handlebars);
  app.set('view engine', 'html');
  app.set('views', PAGE_TEMPLATE_DIRECTORY);

  // The request handler must be the first item
  app.use(sentry.sentryModule.Handlers.requestHandler());

  // i18n adds metadata to a request to help
  // with translating templates on the server.
  app.use(i18n);

  // render the correct template for the locale.
  app.use(localizedRender({ i18n: i18n }));

  app.use(
    helmet.frameguard({
      action: 'deny',
    })
  );

  app.use(
    helmet.referrerPolicy({
      policy: 'no-referrer',
    })
  );
  app.use(helmet.xssFilter());
  app.use(
    helmet.hsts({
      force: true,
      includeSubDomains: true,
      maxAge: config.get('hsts_max_age'),
    })
  );
  app.use(helmet.noSniff());

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

  app.disable('x-powered-by');

  app.use(routeLogging());
  app.use(cookieParser());
  app.use(
    bodyParser.text({
      type: 'text/plain',
    })
  );

  // chrome sends 'application/csp-report' and firefox < 48 sends
  // 'application/json'. 'application/csp-report' is correct:
  // https://w3c.github.io/webappsec/specs/content-security-policy/
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1192840
  app.use(
    bodyParser.json({
      // the 3 entries:
      // json file types,
      // all json content-types
      // csp reports
      type: ['json', '*/json', 'application/csp-report'],
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  if (isCorsRequired()) {
    // JS, CSS and web font resources served from a CDN
    // will be ignored unless CORS headers are present.
    const corsOptions = {
      origin: config.get('public_url'),
    };

    app.route(/\.(js|css|woff|woff2|eot|ttf)$/).get(cors(corsOptions));
  }

  app.use(noindex);

  const routes = require('../lib/routes')(config, i18n, statsd, glean);
  const routeLogger = loggerFactory('server.routes');
  const routeHelpers = routing(app, routeLogger);

  function addNonSettingsRoutes(middleware) {
    addAllReactRoutesConditionally(app, routeHelpers, middleware, i18n);

    /* This creates `app.whatever('/path' ...` handlers for every content-server route and
     * excludes routes in `react-app.js` if corresponding feature flags are on. We manually add
     * these excluded routes for content-server to serve in checks above if the feature flag is
     * set to false or if the request does not contain `showReactApp=true`. Adding these routes
     * must come after React-related route modifications so that `next('route')` skips to these
     * route implementations. */
    routes.forEach(routeHelpers.addRoute);

    // must come after route handling but before wildcard routes
    app.use(
      serveStatic(STATIC_DIRECTORY, {
        maxAge: config.get('static_max_age'),
      })
    );
  }

  if (config.get('env') === 'production') {
    app.get(settingsPath, modifySettingsStatic);

    addNonSettingsRoutes(modifySettingsStatic);

    app.get(settingsPath + '/*', modifySettingsStatic);
  }

  if (config.get('env') === 'development') {
    app.use(settingsPath, createSettingsProxy);

    addNonSettingsRoutes(createSettingsProxy);
  }

  // it's a four-oh-four not found.
  app.use(fourOhFour);

  // Handler for CORS errors
  app.use((err, req, res, next) => {
    if (err.message === 'CORS Error') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'CORS Error',
        statusCode: 401,
      });
    } else {
      next(err);
    }
  });

  // The sentry error handler must be before any other error middleware
  app.use(
    sentry.sentryModule.Handlers.errorHandler({
      shouldHandleError(error) {
        const success = tryCaptureValidationError(error);

        // If the validation was explicitly captured, we return false. Otherwise the
        // error is reported twice.
        return !success;
      },
    })
  );

  // log and capture any errors
  app.use((err, req, res, next) => {
    // in order to track down the culprit of sentry issue, https://sentry.prod.mozaws.net/operations/fxa-content-server-prod/issues/6602579/events/latest/
    if (err.joi && err.joi.isJoi)
      console.error(
        'GLOBAL SENTRY JOI ERROR: ',
        req.path,
        req.query,
        req.originalUrl
      );
    routeHelpers.validationErrorHandler(err, req, res, next);
  });

  // server error!
  app.use(serverErrorHandler);

  return app;
}

let app;
let port;

function catchStartUpErrors(e) {
  if ('EACCES' === e.code) {
    logger.error('Permission Denied, maybe you should run this with sudo?');
  } else if ('EADDRINUSE' === e.code) {
    logger.error(
      'Unable to listen for connections, this service might already be running?'
    );
  }
  console.error(e);
  process.exit(1);
}

function listen(theApp) {
  app = theApp || app;
  if (config.get('use_https')) {
    // Development only... Ops runs this behind nginx
    port = config.get('port');
    const tlsoptions = {
      cert: fs.readFileSync(config.get('cert_path')),
      key: fs.readFileSync(config.get('key_path')),
    };

    https.createServer(tlsoptions, app).listen(port);
    app.on('error', catchStartUpErrors);
  } else {
    port = config.get('port');
    app.listen(port, '0.0.0.0').on('error', catchStartUpErrors);
  }
  if (isMain) {
    logger.info('Firefox Account Content server listening on port', port);
    logger.info(
      `Config scopedKeys.validation: ${JSON.stringify(
        config.get('scopedKeys.validation')
      )}`
    );
  }
  return true;
}

function makeHttpRedirectApp() {
  const redirectProtocol = config.get('use_https') ? 'https://' : 'http://';
  const redirectPort = port === 443 ? '' : ':' + port;

  const httpApp = express();
  httpApp.get('*', function (req, res) {
    const redirectTo = redirectProtocol + req.host + redirectPort + req.url;

    res.redirect(301, redirectTo);
  });

  return httpApp;
}

function listenHttpRedirectApp(httpApp) {
  const httpPort = config.get('use_https')
    ? config.get('redirect_port')
    : config.get('http_port');

  httpApp.listen(httpPort, '0.0.0.0');
  if (isMain) {
    logger.info(
      'Firefox Account HTTP redirect server listening on port',
      httpPort
    );
  }
}

function isCorsRequired() {
  return config.get('static_resource_url') !== config.get('public_url');
}

if (isMain) {
  app = makeApp();
  listen(app);

  const httpApp = makeHttpRedirectApp();
  listenHttpRedirectApp(httpApp);
} else {
  module.exports = {
    listen: listen,
    listenHttpRedirectApp: listenHttpRedirectApp,
    makeApp: makeApp,
    makeHttpRedirectApp: makeHttpRedirectApp,
  };
}
