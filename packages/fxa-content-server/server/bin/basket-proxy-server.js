#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var url = require('url');
var mozlog = require('mozlog');
var request = require('request');
var p = require('bluebird');

var config = require('../lib/configuration');
mozlog.config(config.get('logging'));

var logger = require('mozlog')('server.basketproxy');

var express = require('express');
var bodyParser = require('body-parser');

var API_KEY = config.get('basket.api_key');
var API_URL = config.get('basket.api_url');
var VERIFY_URL = config.get('oauth_url') + '/v1/verify';

// Verify an OAuth token and return the associated credentials
function verifyOAuthToken(token) {
  var defer = p.defer();

  request.post({
    url: VERIFY_URL,
    json: {
      token: token
    }
  }, function(err, res, body) {
    // TODO use an actual error format
    if (err) {
      logger.error('auth', err);
      return defer.reject(err);
    }
    if (body.code >= 400) {
      logger.debug('unauthorized', body);
      return defer.reject(new Error(body.message));
    }
    logger.debug('auth.valid', body);
    return defer.resolve(body);
  });

  return defer.promise;
}

// Send a request to the Basket backend
function basketRequest(path, method, params) {
  var req = request({
    url: API_URL + path,
    strictSSL: true,
    method: method,
    headers: {
      'X-API-Key': API_KEY
    },
    form: params
  });

  return req;
}

function initApp() {
  var app = express();
  app.use(bodyParser.json());

  app.get('/lookup-user', function (req, res) {

    verifyOAuthToken(req.headers.authorization)
      .then(function (creds) {
        basketRequest('/lookup-user?email=' + creds.email, 'get').pipe(res);
      });
  });

  app.post('/subscribe', function (req, res) {

    verifyOAuthToken(req.headers.authorization)
      .then(function (creds) {
        basketRequest('/subscribe', 'post', {
          email: creds.email,
          newsletter_id: req.params.newsletter_id,
          lang: req.params.lang
        }).pipe(res);
    });
  });

  app.post('/unsubscribe', function (req, res) {

    verifyOAuthToken(req.headers.authorization)
      .then(function (creds) {
        basketRequest('/unsubscribe', 'post', {
          email: creds.email,
          newsletter_id: req.params.newsletter_id
        }).pipe(res);
    });
  });

  return app;
}

function listen(app) {
  var serverUrl = url.parse(config.get('marketing_email_url'));
  app.listen(serverUrl.port, serverUrl.hostname);
  logger.info('FxA Basket Proxy listening on port', serverUrl.port);
  return true;
}

var app = initApp();
listen(app);
