/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = require('rc')(
  'fxa_customs',
  {
    logLevel: 'trace',
    port: 7000,
    memcached: '127.0.0.1:11211',
    recordLifetimeSeconds: 900,
    blockIntervalSeconds: 60 * 15,
    rateLimitIntervalSeconds: 60 * 15,
    maxEmails: 3,
    maxBadLogins: 2
  }
)
