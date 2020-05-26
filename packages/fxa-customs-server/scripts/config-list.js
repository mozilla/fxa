#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Use in combination with config-set.js to update customs server settings
 in memcache. config-list.js reads the settings from the memcache server
 specified by the first argument and writes json to stdout.

 Example:

 $ config-list.js localhost:11211 > settings.json
 $ vi settings.json
 $ cat settings.json | config-set.js localhost:11211

 /*/

/* eslint-disable no-console */
var Memcached = require('memcached');
var P = require('bluebird');

P.promisifyAll(Memcached.prototype);

if (process.argv.length < 3) {
  var usage = 'Usage: config-list.js <memcacheHost:port>';
  return console.error(usage);
}

if (!/.+:\d+/.test(process.argv[2])) {
  var x = "use a host:port like 'localhost:11211'";
  return console.error(x);
}

var mc = new Memcached(process.argv[2], { namespace: 'fxa~' });

var output = {
  limits: {},
  allowedIPs: [],
  allowedEmailDomains: [],
  allowedPhoneNumbers: [],
  requestChecks: {},
};

mc.getAsync('limits')
  .then(function (data) {
    if (!data) {
      console.error('no limits set');
    } else {
      output.limits = data;
    }
    return mc.getAsync('allowedIPs');
  })
  .then(function (data) {
    if (!data) {
      console.error('no allowedIPs set');
    } else {
      output.allowedIPs = data;
    }
    return mc.getAsync('allowedEmailDomains');
  })
  .then(function (data) {
    if (!data) {
      console.error('no allowedEmailDomains set');
    } else {
      output.allowedEmailDomains = data;
    }
    return mc.getAsync('allowedPhoneNumbers');
  })
  .then(function (data) {
    if (!data) {
      console.error('no allowedPhoneNumbers set');
    } else {
      output.allowedPhoneNumbers = data;
    }
    return mc.getAsync('requestChecks');
  })
  .then(function (data) {
    if (!data) {
      console.error('no requestChecks set');
    } else {
      output.requestChecks = data;
    }
  })
  .then(function () {
    mc.end();
    console.log(JSON.stringify(output, null, 2));
  });
