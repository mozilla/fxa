#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

Block an ip address for a number of seconds.

Example:

$ ./block-ip.js localhost:11211 127.0.0.1 600

/*/

/* eslint-disable no-console */
var net = require('net');
var Memcached = require('memcached');
const P = require('bluebird');
P.promisifyAll(Memcached.prototype);

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

const { fetchRecord, setRecord } = require('../lib/records')(
  mc,
  {},
  {},
  lifetime
);

async function main() {
  const ip = process.argv[3];

  try {
    const ipRecord = await fetchRecord(ip, IpRecord.parse);
    ipRecord.block();

    await setRecord(ipRecord);

    console.log('successfully blocked', ipRecord, lifetime);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }

  mc.end();
}

main();
