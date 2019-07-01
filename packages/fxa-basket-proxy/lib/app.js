/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var config = require('./config');
var verifyOAuthToken = require('./verify');
var logSummary = require('./logging/summary');
var routes = require('./routes');

var CORS_ORIGIN = config.get('cors_origin');

module.exports = function initApp() {
  var app = express();
  app.set('x-powered-by', false);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(logSummary());
  app.use(
    cors({
      origin: CORS_ORIGIN,
    })
  );

  app.use(verifyOAuthToken());

  app.get('/', routes.version);
  app.get('/__version__', routes.version);
  app.get('/lookup-user', routes.lookup);
  app.post('/subscribe', routes.subscribe);
  app.post('/unsubscribe', routes.unsubscribe);
  app.post('/subscribe_sms', routes.sms);

  return app;
};
