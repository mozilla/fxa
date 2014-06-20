/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = require('rc')(
  'fxa_customs',
  {
    logLevel: 'trace',
    port: 7000,
    memcached: '127.0.0.1:11211',
    recordLifetimeSeconds: 900,         // memcache record expiry
    blockIntervalSeconds: 60 * 60 * 24, // duration of a manual ban
    rateLimitIntervalSeconds: 60 * 15,  // duration of automatic throttling
    maxEmails: 3,   // number of emails sent within rateLimitIntervalSeconds before throttling
    maxBadLogins: 2 // number failed login attempts within rateLimitIntervalSeconds before throttling
  }
)
