/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*
 *  A fake basket server API, for testing and development purposes.
 */

var config = require('../config');
var basket = require('./');

var express = require('express');
var bodyParser = require('body-parser');

var API_KEY = config.get('basket.api_key');


function verifyApiKey (req, res, next) {
  var key = req.headers['x-api-key'];
  if (key && key === API_KEY) {
    return next();
  }
  res.status(400).json(basket.errorResponse('unauthorized', basket.errors.AUTH_ERROR));
}


function extend(target, source) {
  for (var key in source) {
    target[key] = source[key];
  }

  return target;
}


module.exports = function initApp() {

  var userData = {};
  var tokenToUser = {};

  var tokens = 0;
  function newToken() {
    return tokens++;
  }

  var app = express();
  app.use(bodyParser.urlencoded());
  app.use(verifyApiKey);

  app.get('/lookup-user/', function (req, res) {
    var email = req.query.email;
    if (! userData[email]) {
      res.status(404).json(basket.errorResponse('unknown-email', basket.errors.UNKNOWN_EMAIL));
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
      res.status(400).json(basket.errorResponse('unknown-token', basket.errors.UNKNOWN_TOKEN));
      return;
    }
  });

  return app;
};
