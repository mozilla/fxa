/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// IP address geolocation

'use strict';

const config = require('./configuration').get('geodb');
const geodb = require('../../../fxa-geodb')(config);
const logger = require('./logging/log')('server.geo');
const remoteAddress = require('./remote-address');

module.exports = request => {
  if (!config.enabled) {
    return {};
  }

  try {
    return geodb(remoteAddress(request).clientAddress);
  } catch (err) {
    logger.error('geodb.error', err);
    return {};
  }
};
