#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

Block an ip address for a number of seconds.

Example:

$ ./block-ip.js localhost:11211 localhost 600

/*/

/* eslint-disable no-console */
var net = require('net');
var Memcached = require('memcached');

if (process.argv.length < 5) {
  var usage = 'Usage: block-ip.js <memcacheHost:port> <ip> <seconds>';
  return console.error(usage);
}

if (!/.+:\d+/.test(process.argv[2])) {
  var x = "use a host:port like 'localhost:11211'";
  return console.error(x);
}

if (!net.isIPv4(process.argv[3])) {
  return console.error('second argument must be an IPv4');
}

var lifetime = parseInt(process.argv[4], 10);
if (!lifetime || lifetime < 0) {
  return console.error('third argument must be a positive integer of seconds');
}

var mc = new Memcached(process.argv[2], { namespace: 'fxa~' });
var IpRecord = require('../lib/ip_record')({
  blockIntervalMs: lifetime * 1000,
  ipRateLimitIntervalMs: lifetime * 1000,
  ipRateLimitBanDurationMs: lifetime * 1000,
});
var log = {
  error: function() {},
  info: function() {},
};
var ban = require('../lib/bans/handler')(lifetime, mc, null, IpRecord, log);

ban(
  {
    ban: {
      ip: process.argv[3],
    },
  },
  function(err) {
    if (err) {
      console.error(err);
      return process.exit(1);
    }
    mc.end();
  }
);
