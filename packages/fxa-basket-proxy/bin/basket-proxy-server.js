#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Runs an OAuth-authenticted proxy API to a basket server.
 */

var url = require('url');

var config = require('../lib/config');
var logger = require('../lib/logging')('server');

var app = require('../lib/app.js');

function listen(app) {
  var proxyUrl = url.parse(config.get('basket.proxy_url'));
  app.listen(proxyUrl.port, proxyUrl.hostname);
  logger.info('FxA Basket Proxy listening on port', proxyUrl.port);
  return true;
}

listen(app());
