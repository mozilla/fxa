#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

Look up customs info for an ip, email, or ip+email.

Examples:

$ ./customs-info.js localhost:11211 127.0.0.1
$ ./customs-info.js localhost:11211 test@example.com
$ ./customs-info.js localhost:11211 127.0.0.1test@example.com

/*/

/* eslint-disable no-console */
var Memcached = require('memcached');

if (process.argv.length < 4) {
  var usage = 'Usage: customs-info.js <memcacheHost:port> <key>';
  return console.error(usage);
}

// eslint-disable-next-line space-unary-ops
if (!/.+:\d+/.test(process.argv[2])) {
  var x = "use a host:port like 'localhost:11211'";
  return console.error(x);
}

var mc = new Memcached(process.argv[2], { namespace: 'fxa~' });

mc.get(process.argv[3], function(err, data) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }
  if (!data) {
    mc.end();
    return console.error('no record');
  }
  if (data.bk) {
    console.error('blocked at %s', new Date(data.bk));
  }
  if (data.lf && data.lf.length > 0) {
    console.error('login failures: %d', data.lf.length);
  }
  if (data.as && data.as.length > 0) {
    console.error('account status: %d', data.as.length);
  }
  if (data.rl) {
    console.error('rate limited at %s', new Date(data.rl));
  }
  if (data.xs && data.xs.length > 0) {
    console.error('emails sent %d', data.xs.length);
  }
  if (data.pr) {
    console.error('password reset at %s', new Date(data.pr));
  }
  console.error('raw data:');
  console.log(JSON.stringify(data, null, 2));
  mc.end();
});
