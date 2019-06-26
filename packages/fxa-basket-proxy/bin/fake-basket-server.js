#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Runs a fake in-memory basket server, for dev/testing purposes.
 */

var url = require('url');

var config = require('../lib/config');
var logger = require('../lib/logging')('server');

const app = require('../lib/basket/fake');

function listen(app) {
  var apiUrl = url.parse(config.get('basket.api_url'));
  app.listen(apiUrl.port, apiUrl.hostname);
  logger.info(`FxA Fake Basket Server listening on port ${apiUrl.port}`);
  return true;
}

listen(app(logger));
