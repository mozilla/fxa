#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var fs = require('fs');
var mozlog = require('mozlog');

var config = require('../lib/configuration');
mozlog.config(config.get('logging'));

var logger = require('mozlog')('server.main');

var express = require('express');
var bodyParser = require('body-parser');

function makeApp() {
  var violations = fs.createWriteStream('violations.txt', {flags: 'a'});
  var app = express();
  app.use(bodyParser.json());
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

function listen(app) {
  var port = 80;
  app.listen(port, '0.0.0.0');
  logger.info('Firefox Account CSP Violation server listening on port', port);
  return true;
}

var app = makeApp();
listen(app);
