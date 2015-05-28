#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var url = require('url');
var mozlog = require('mozlog');

var config = require('../lib/configuration');
mozlog.config(config.get('logging'));

var logger = require('mozlog')('server.nullbasket');

var express = require('express');
var bodyParser = require('body-parser');

var API_KEY = config.get('basket.api_key');
var API_URL = config.get('basket.api_url');


// Error codes are defined in:
// https://github.com/mozilla/basket-client/blob/master/basket/errors.py
var BASKET_ERRORS = {
  NETWORK_FAILURE: 1,
  INVALID_EMAIL: 2,
  UNKNOWN_EMAIL: 3,
  UNKNOWN_TOKEN: 4,
  USAGE_ERROR: 5,
  EMAIL_PROVIDER_AUTH_FAILURE: 6,
  AUTH_ERROR: 7,
  SSL_REQUIRED: 8,
  INVALID_NEWSLETTER: 9,
  INVALID_LANGUAGE: 10,
  EMAIL_NOT_CHANGED: 11,
  CHANGE_REQUEST_NOT_FOUND: 12,

  // If you get this, report it as a bug so we can add a more specific
  // error code.
  UNKNOWN_ERROR: 99
};

function errorResponse(desc, code) {
  // Format from
  // https://basket.readthedocs.org/en/latest/newsletter_api.html
  return {
    status: 'error',
    desc: String(desc),
    code: code || BASKET_ERRORS.UNKNOWN_ERROR
  };
}

function verifyApiKey (req, res, next) {
  var key = req.headers['x-api-key'];
  if (key && key === API_KEY) {
    return next();
  }
  res.status(400).json(errorResponse('unauthorized', BASKET_ERRORS.AUTH_ERROR));
}

var userData = {};
var tokenToUser = {};

var tokens = 0;
function newToken() {
  return tokens++;
}

function extend(target, source) {
  for (var key in source) {
    target[key] = source[key];
  }

  return target;
}

function initApp() {
  var app = express();
  app.use(bodyParser.urlencoded());
  app.use(verifyApiKey);

  app.get('/lookup-user/', function (req, res) {
    var email = req.query.email;
    if (! userData[email]) {
      res.status(404).json(errorResponse('unknown-email', BASKET_ERRORS.UNKNOWN_EMAIL));
      return;
    }

    var dataToSend = extend({ status: 'ok' }, userData[email]);
    res.status(200).json(dataToSend);
  });

  app.post('/subscribe/', function (req, res) {
    var params = req.body;
    var email = params.email;
    var user = userData[email];
    var token;
    if (! user) {
      token = newToken();
      userData[email] = {
        email: email,
        token: token,
        newsletters: params.newsletters.split(',')
      };
      tokenToUser[token] = userData[email];
    } else {
      user.newsletters = user.newsletters.concat(params.newsletters.split(','));
    }
    res.status(200).json({ status: 'ok' });
  });

  app.post('/unsubscribe/:token/', function (req, res) {
    var user = tokenToUser[req.params.token];
    var newsletters = req.body.newsletters.split(',');
    if (user) {
      user.newsletters = user.newsletters.filter(function (id) {
        return newsletters.indexOf(id) === -1;
      });
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json(errorResponse('unknown-token', BASKET_ERRORS.UNKNOWN_TOKEN));
      return;
    }
  });

  return app;
}

function listen(app) {
  var serverUrl = url.parse(API_URL);
  app.listen(serverUrl.port, serverUrl.hostname);
  logger.info('FxA Null Basket Server listening on port', serverUrl.port);
  return true;
}

var app = initApp();
listen(app);
