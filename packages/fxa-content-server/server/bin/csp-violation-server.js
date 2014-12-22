#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs');
var https = require('https');

var mozlog = require('mozlog');

var config = require('../lib/configuration');
mozlog.config(config.get('logging'));

var logger = require('mozlog')('server.main');

var express = require('express');

function makeApp() {
  'use strict';

  var violations = fs.createWriteStream('violations.txt', {flags: 'a'});
  var app = express();
  app.use(express.bodyParser());
  app.get('/index.html', function (req, res) {
    res.json({result: 'ok'});
  });
  app.post('/_/csp-violation', function (req, res) {
    logger.warn('VIOLATION REPORT');
    var data = {
      when: (new Date()).getTime() / 1000,
      ua: req.get('user-agent'),
      report: req.body
    };
    violations.write(JSON.stringify(data) + '\n');
    logger.warn(data);
    res.json({result: 'ok'});
  });

  return app;
}

var app,
    port;

function listen(theApp) {
  'use strict';

  port = 80;
  app.listen(port, '0.0.0.0');
  logger.info('Firefox Account CSP Violation server listening on port', port);
  return true;
}

app = makeApp();
listen(app);
