#!/usr/bin/env node

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

var util = require('util');
var helmet = require('helmet');
var express = require('express');
var connect_fonts = require('connect-fonts');
var firasans = require('connect-fonts-firasans');
var clearsans = require('connect-fonts-clearsans');

var config = require('../lib/configuration');
var routes = require('../lib/routes');
// Side effect - Adds default_fxa and dev_fxa to express.logger formats
var routeLogging = require('../lib/logging/route_logging');

var STATIC_DIRECTORY =
              path.join(__dirname, '..', '..', config.get('static_directory'));
var VIEWS_ROOT = path.join(__dirname, '..', 'views');

function makeApp() {
  var app = express();

  app.use(helmet.xframe('deny'));
  app.use(helmet.iexss());
  app.use(helmet.hsts(config.get('hsts_max_age'), true));
  app.disable('x-powered-by');

  app.use(connect_fonts.setup({
    fonts: [ firasans, clearsans ],
    allow_origin: [ config.get('public_url') ],
    max_age: config.get('font_max_age_ms'),
    compress: true
  }));

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
