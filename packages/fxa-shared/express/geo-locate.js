/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// IP address geolocation

'use strict';

module.exports = (geodb) => (remoteAddress) => (log) => (request) => {
  try {
    return geodb(remoteAddress(request).clientAddress);
  } catch (err) {
    log.error('geodb.error', err);
    return {};
  }
};
