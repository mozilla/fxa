#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var fs = require('fs');
var https = require('https');
var path = require('path');
var config = require('../lib/configuration');

var mozlog = require('mozlog');

// This can't possibly be best way to librar-ify this module.
var isMain = process.argv[1] === __filename;
if (isMain) {
  // ./server is our current working directory
  process.chdir(path.dirname(__dirname));
}

mozlog.config(config.get('logging'));

var logger = require('mozlog')('server.main');

var helmet = require('helmet');
var express = require('express');
var consolidate = require('consolidate');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');

var i18n = require('../lib/i18n')(config.get('i18n'));
var routes = require('../lib/routes')(config, i18n);

// Side effect - Adds default_fxa and dev_fxa to express.logger formats
var routeLogging = require('../lib/logging/route_logging');

var fourOhFour = require('../lib/404');
var serverErrorHandler = require('../lib/500');
var localizedRender = require('../lib/localized-render');
var csp = require('../lib/csp');


var STATIC_DIRECTORY =
  path.join(__dirname, '..', '..', config.get('static_directory'));

var PAGE_TEMPLATE_DIRECTORY =
  path.join(config.get('page_template_root'), config.get('page_template_subdirectory'));

logger.info('page_template_directory: %s', PAGE_TEMPLATE_DIRECTORY);

function makeApp() {
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
  app.use(helmet.xssFilter());
  app.use(helmet.hsts({
    force: true,
    includeSubdomains: true,
    maxAge: config.get('hsts_max_age')
  }));
  app.use(helmet.nosniff());

  if (config.get('csp.enabled')) {
    app.use(csp);
  }

  app.disable('x-powered-by');

  app.use(routeLogging());
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.text({
    type: 'text/plain'
  }));

  // chrome sends 'application/csp-report' and firefox sends 'application/json'
  // correct is 'application/csp-report': https://w3c.github.io/webappsec/specs/content-security-policy/
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1192840
  app.use(bodyParser.json({
    type: ['json', 'application/csp-report']
  }));

  var ableOptions = {
    addRoutes: true,
    dir: config.get('experiments.dir'),
    git: config.get('experiments.git'),
    watch: config.get('experiments.watch')
  };

  app.use(require('express-able')(ableOptions));

  routes(app);

  app.use(serveStatic(STATIC_DIRECTORY, {
    maxAge: config.get('static_max_age')
  }));

  // it's a four-oh-four not found.
  app.use(fourOhFour);

  // server error!
  app.use(serverErrorHandler);

  return app;
}

var app;
var port;

function catchStartUpErrors(e) {
  if ('EACCES' === e.code) {
    logger.error('Permission Denied, maybe you should run this with sudo?');
  } else if ('EADDRINUSE' === e.code) {
    logger.error('Unable to listen for connections, this service might already be running?');
  }
  console.error(e);
  process.exit(1);
}

function listen(theApp) {
  app = theApp || app;
  if (config.get('use_https')) {
    // Development only... Ops runs this behind nginx
    port = config.get('port');
    var tlsoptions = {
      cert: fs.readFileSync(config.get('cert_path')),
      key: fs.readFileSync(config.get('key_path'))
    };

    https.createServer(tlsoptions, app).listen(port);
    app.on('error', catchStartUpErrors);
  } else {
    port = config.get('port');
    app.listen(port, '0.0.0.0').on('error', catchStartUpErrors);
  }
  if (isMain) {
    logger.info('Firefox Account Content server listening on port', port);
  }
  return true;
}

function makeHttpRedirectApp () {
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
  var httpPort = config.get('use_https') ? config.get('redirect_port') : config.get('http_port');

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
    listenHttpRedirectApp: listenHttpRedirectApp,
    makeApp: makeApp,
    makeHttpRedirectApp: makeHttpRedirectApp
  };
}
