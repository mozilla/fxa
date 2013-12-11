#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

// This can't possibly be best way to librar-ify this module.
var isMain = process.argv[1] === __filename;
if (isMain) {
  // ./server is our current working directory
  process.chdir(path.dirname(__dirname));
}

const util = require('util');
const helmet = require('helmet');
const express = require('express');

const config = require('../lib/configuration');
const routes = require('../lib/routes');
// Side effect - Adds default_fxa and dev_fxa to express.logger formats
const routeLogging = require('../lib/logging/route_logging');

const STATIC_DIRECTORY =
              path.join(__dirname, '..', '..', config.get('static_directory'));
const VIEWS_ROOT = path.join(__dirname, '..', 'views');

function makeApp() {
  var app = express();

  app.use(helmet.xframe('deny'));
  app.use(helmet.iexss());
  app.disable('x-powered-by');

  app.use(routeLogging());
  app.use(express.cookieParser());
  app.use(express.bodyParser());


  routes(app);

  app.use(express.static(STATIC_DIRECTORY));
  return app;
}

var app,
    port;

if (isMain) {
  app = makeApp();
}

function listen(theApp) {
  app = theApp || app;
  if (config.get('use_https')) {
    // Development only... Ops runs this behind nginx
    port = 443;
    app.listen(443);
    app.on('error', function(e) {
      if ('EACCES' == e.code) {
        console.error('Permission Denied, maybe you should run this with sudo?');
      } else if ('EADDRINUSE' == e.code) {
        console.error('Unable to listen for connections, this service might already be running?');
      }
      throw e;
    });
  } else {
    port = config.get('port');
    app.listen(port, '0.0.0.0');
  }
  if (isMain) {
    console.log('Firefox Account Content server listening on port', port);
  }
  return true;
}

if (isMain) {
  listen();
} else {
  module.exports = {listen: listen, makeApp: makeApp};
}
