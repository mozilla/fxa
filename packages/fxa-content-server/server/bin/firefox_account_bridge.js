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

const clientSessions = require('client-sessions'),
      config = require('../lib/configuration'),
      express = require('express'),
      nunjucks = require('nunjucks'),
      routes = require('../lib/routes'),
      urlparse = require('urlparse'),
      util = require('util');

function makeApp() {
  var app = express();
  var env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(
          path.join(__dirname, '..', 'views')));

  env.express(app);
  app.use(express.cookieParser());
  app.use(express.bodyParser());

  var isHttps = 'https' === urlparse(config.get('public_url')).scheme;

  // BigTent must be deployed behind SSL.
  // Tell client-sessions everything will be alright
  app.use(function(req, res, next) {
      req.connection.proxySecure = isHttps;
      next();
  });

  var sess_config = config.get('client_sessions');
  app.use(clientSessions({
      cookieName: sess_config.cookie_name,
      secret:     sess_config.secret,
      duration:   sess_config.duration,
      cookie: {
        secure: isHttps,
        httpOnly: true,
        maxAge: sess_config.duration
      }
  }));

  app.use(express.csrf());
  app.use(function(req, resp, next) {
      resp.locals({'csrf_token': req.session._csrf});
      next();
  });

  routes(app);
  app.use(express.static(path.join(process.cwd(), '..', 'static')));
  return app;
}

var app,
    lstnUrl,
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
    lstnUrl = util.format('https://%s', config.get('issuer'));
  } else {
    port = config.get('port');
    app.listen(port, '0.0.0.0');
    console.log('config.get("issuer")', config.get('issuer'));
    lstnUrl = util.format('http://%s:%s', config.get('issuer'), port);
  }
  if (isMain) { // -> log
    console.log('Firefox Account Bridge listening at', lstnUrl);
  }
  return true; // used by test
}

if (isMain) {
  listen();
} else {
  module.exports = {listen: listen, makeApp: makeApp};
}
