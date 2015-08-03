#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var url = require('url');
var mozlog = require('mozlog');
var request = require('request');

var config = require('../lib/configuration');
mozlog.config(config.get('logging'));

var logger = require('mozlog')('server.basketproxy');

// Side effect - Adds default_fxa and dev_fxa to express.logger formats
var routeLogging = require('../lib/logging/route_logging');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var CORS_ORIGIN = config.get('public_url');
var API_KEY = config.get('basket.api_key');
var API_URL = config.get('basket.api_url');
var API_TIMEOUT = config.get('basket.api_timeout');
var VERIFY_URL = config.get('oauth_url') + '/v1/verify';


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

// Verify an OAuth token and return the associated credentials
function verifyOAuthToken() {
  return function (req, res, next) {
    var authHeader = req.headers && req.headers.authorization;

    if (! authHeader) {
      logger.error('auth.missing-authorization-header');
      res.status(400).json(errorResponse('missing authorization header', BASKET_ERRORS.USAGE_ERROR));
      return;
    }

    if (! authHeader.match(/^Bearer /)) {
      logger.error('auth.invalid-authorization-header');
      res.status(400).json(errorResponse('invalid authorization header', BASKET_ERRORS.USAGE_ERROR));
      return;
    }
    var token = authHeader.replace(/^Bearer /, '');

    logger.info('auth.valid.starting');

    request.post({
      url: VERIFY_URL,
      json: {
        token: token
      }
    }, function (err, _, body) {
      if (err) {
        logger.error('auth.error', err);
        res.status(400).json(errorResponse(err, BASKET_ERRORS.UNKNOWN_ERROR));
        return;
      }

      if (body.code >= 400) {
        logger.error('auth.unauthorized', body);
        res.status(body.code).json(errorResponse('unauthorized', BASKET_ERRORS.AUTH_ERROR));
        return;
      }

      if (! body.email) {
        logger.error('auth.missing-email', body);
        res.status(400).json(errorResponse('missing email', BASKET_ERRORS.AUTH_ERROR));
        return;
      }

      if (body.scope.indexOf('basket:write') === -1) {
        logger.error('auth.invalid-scope', body);
        res.status(400).json(errorResponse('invalid scope', BASKET_ERRORS.AUTH_ERROR));
        return;
      }

      logger.info('auth.valid', body);

      res.locals.creds = body;

      next();
    });
  };
}

// Send a request to the Basket backend
function basketRequest(path, method, params, done) {
  var req = request({
    url: API_URL + path,
    strictSSL: true,
    method: method,
    timeout: API_TIMEOUT,
    headers: {
      'X-API-Key': API_KEY
    },
    form: params
  }, done);

  return req;
}

function initApp() {
  var app = express();
  app.use(routeLogging());
  app.use(bodyParser.json());

  app.use(cors({
    origin: CORS_ORIGIN
  }));

  app.use(verifyOAuthToken());

  app.get('/lookup-user', function (req, res) {
    var params = req.body;
    var email = encodeURIComponent(res.locals.creds.email);

    basketRequest('/lookup-user/?email=' + email, 'get', params)
      .on('error', function (error) {
        logger.error('lookup-user.error', error);
        res.status(500).json(errorResponse(error, BASKET_ERRORS.UNKNOWN_ERROR));
      })
      .pipe(res);
  });

  app.post('/subscribe', function (req, res) {
    var params = req.body;
    params.email = res.locals.creds.email;
    logger.info('subscribe.params', params);

    basketRequest('/subscribe/', 'post', params)
      .on('error', function (error) {
        logger.error('subscribe.error', error);
        res.status(500).json(errorResponse(error, BASKET_ERRORS.UNKNOWN_ERROR));
      })
      .pipe(res);
  });

  app.post('/unsubscribe', function (req, res) {
    var creds = res.locals.creds;
    var email = encodeURIComponent(creds.email);
    basketRequest('/lookup-user/?email=' + email, 'get', {}, function (lookupError, httpRequest, body) {
      if (lookupError) {
        logger.error('lookup-user.error', lookupError);
        res.status(400).json(errorResponse(lookupError, BASKET_ERRORS.UNKNOWN_ERROR));
        return;
      }

      var responseData;
      try {
        responseData = JSON.parse(body);
      } catch (parseError) {
        logger.error('lookup-user.cannot-parse-response', parseError);
        res.status(400).json(errorResponse(parseError, BASKET_ERRORS.UNKNOWN_ERROR));
        return;
      }
      if (responseData.status !== 'ok') {
        logger.error('lookup-user status not ok: ' + responseData.status);
        res.status(httpRequest.statusCode).json(responseData);
        return;
      }

      var params = req.body;
      params.email = creds.email;
      logger.info('unsubscribe.params', params);

      basketRequest('/unsubscribe/' + responseData.token + '/', 'post', params)
        .on('error', function (error) {
          logger.error('unsubscribe.error', error);
          res.status(500).json(errorResponse(error, BASKET_ERRORS.UNKNOWN_ERROR));
        })
        .pipe(res);
    });
  });

  return app;
}

function listen(app) {
  var serverUrl = url.parse(config.get('basket.proxy_url'));
  app.listen(serverUrl.port, serverUrl.hostname);
  logger.info('FxA Basket Proxy listening on port', serverUrl.port);
  return true;
}

var app = initApp();
listen(app);
