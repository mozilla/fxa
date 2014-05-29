#!/usr/bin/env node
var fs = require('fs');
var https = require('https');

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');

// This can't possibly be best way to librar-ify this module.
var isMain = process.argv[1] === __filename;
if (isMain) {
  // ./server is our current working directory
  process.chdir(path.dirname(__dirname));
}

// set up common formatting for all loggers
var intel = require('intel');
intel.basicConfig({
  format: {
    format: '[%(date)s] %(name)s.%(levelname)s: %(message)s',
    datefmt: '%Y-%m-%dT%H:%M:%S.%LZ'
  }
});
var logger = require('intel').getLogger('server.main');

var helmet = require('helmet');
var express = require('express');
var consolidate = require('consolidate');

var config = require('../lib/configuration');
var i18n = require('../lib/i18n')(config.get('i18n'));
var templates = require('../lib/templates')(config.get('template_path'), i18n);
var routes = require('../lib/routes')(config, templates, i18n);

// Side effect - Adds default_fxa and dev_fxa to express.logger formats
var routeLogging = require('../lib/logging/route_logging');

var fourOhFour = require('../lib/404');
var serverErrorHandler = require('../lib/500');
var localizedRender = require('../lib/localized-render');

var STATIC_DIRECTORY =
  path.join(__dirname, '..', '..', config.get('static_directory'));

var PAGE_TEMPLATE_DIRECTORY =
  path.join(config.get('page_template_root'), config.get('page_template_subdirectory'));

logger.info('page_template_directory: %s', PAGE_TEMPLATE_DIRECTORY);

function makeApp() {
  'use strict';

  var app = express();

  app.engine('html', consolidate.handlebars);
  app.set('view engine', 'html');
  app.set('views', PAGE_TEMPLATE_DIRECTORY);

  // i18n adds metadata to a request to help
  // with translating templates on the server.
  app.use(i18n);

  // render the correct template for the locale.
  app.use(localizedRender({ i18n: i18n }));

  app.use(helmet.xframe('deny'));
  app.use(helmet.iexss());
  app.use(helmet.hsts(config.get('hsts_max_age'), true));
  app.disable('x-powered-by');

  app.use(routeLogging());
  app.use(express.cookieParser());
  app.use(express.bodyParser());


  routes(app);

  // workaround for reserved word bug:
  // https://github.com/marijnh/acorn/issues/85
  app.use(express['static'](STATIC_DIRECTORY, {
      maxAge: config.get('static_max_age')
  }));

  // it's a four-oh-four not found.
  app.use(fourOhFour);

  // server error!
  app.use(serverErrorHandler);

  return app;
}

var app,
    port;

function listen(theApp) {
  'use strict';

  app = theApp || app;
  if (config.get('use_https')) {
    // Development only... Ops runs this behind nginx
    port = config.get('port');
    var tlsoptions = {
        key: fs.readFileSync(config.get('key_path')),
        cert: fs.readFileSync(config.get('cert_path'))
    }
    https.createServer(tlsoptions, app).listen(port);
    app.on('error', function (e) {
      if ('EACCES' === e.code) {
        logger.error('Permission Denied, maybe you should run this with sudo?');
      } else if ('EADDRINUSE' === e.code) {
        logger.error('Unable to listen for connections, this service might already be running?');
      }
      throw e;
    });
  } else {
    port = config.get('port');
    app.listen(port, '0.0.0.0');
  }
  if (isMain) {
    logger.info('Firefox Account Content server listening on port', port);
  }
  return true;
}

function makeHttpRedirectApp () {
  'use strict';

  var redirectProtocol = config.get('use_https') ? 'https://' : 'http://';
  var redirectPort = port === 443 ? '' : ':' + port;

  var httpApp = express();
  httpApp.get('*', function (req, res) {
    var redirectTo = redirectProtocol + req.host + redirectPort + req.url;

    res.redirect(301, redirectTo);
  });

  return httpApp;
}

function listenHttpRedirectApp(httpApp) {
  'use strict';
  var httpPort = config.get('use_https') ? 80 : config.get('http_port');

  httpApp.listen(httpPort, '0.0.0.0');
  if (isMain) {
    logger.info('Firefox Account HTTP redirect server listening on port', httpPort);
  }
}

if (isMain) {
  app = makeApp();
  listen(app);

  var httpApp = makeHttpRedirectApp();
  listenHttpRedirectApp(httpApp);
} else {
  module.exports = {
    listen: listen,
    makeApp: makeApp,
    makeHttpRedirectApp: makeHttpRedirectApp,
    listenHttpRedirectApp: listenHttpRedirectApp
  };
}
