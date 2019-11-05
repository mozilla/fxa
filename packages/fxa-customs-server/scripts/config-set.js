#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Use in combination with config-list.js to update customs server settings
 in memcache. config-set.js reads json from stdin and writes it to the
 memcache server specified by the first argument.

 Example:

 $ config-list.js localhost:11211 > settings.json
 $ vi settings.json
 $ cat settings.json | config-set.js localhost:11211

 /*/

/* eslint-disable no-console */
var Memcached = require('memcached');
var P = require('bluebird');
var BL = require('bl');
var merge = require('lodash.merge');
var isEqual = require('lodash.isequal');

P.promisifyAll(Memcached.prototype);

if (process.argv.length < 3) {
  var usage = 'Usage: cat settings.json | config-set.js <memcacheHost:port>';
  return console.error(usage);
}

// eslint-disable-next-line space-unary-ops
if (!/.+:\d+/.test(process.argv[2])) {
  var x = "use a host:port like 'localhost:11211'";
  return console.error(x);
}

function writeMergedSettings(mc, key, newSettings) {
  return mc.getAsync(key).then(function(settings) {
    if (typeof newSettings !== 'object' || Array.isArray(newSettings)) {
      throw new Error('tried to merge non-Object-typed settings value');
    }
    settings = settings || {};
    merge(settings, newSettings);
    return mc.setAsync(key, settings, 0);
  });
}

function clobberSettings(mc, key, newSettings) {
  return mc.getAsync(key).then(function(settings) {
    if (!Array.isArray(newSettings)) {
      throw new Error('tried to clobber non-Array-typed settings value');
    }
    if (settings && !isEqual(settings, newSettings)) {
      console.warn('Clobbering existing settings for "' + key + '":');
      console.warn('Old:', settings);
      console.warn('New:', newSettings);
    }
    return mc.setAsync(key, newSettings, 0);
  });
}

var b = process.stdin.pipe(new BL());

process.stdin.on('end', function() {
  var input = null;
  try {
    input = JSON.parse(b.toString());
  } catch (e) {
    return console.error('Input is not valid JSON');
  }
  var mc = new Memcached(process.argv[2], { namespace: 'fxa~' });

  var actions = [];
  if (input.limits) {
    actions.push(writeMergedSettings(mc, 'limits', input.limits));
  }

  if (input.allowedIPs) {
    // It's an array, we can't sensibly merge it.
    actions.push(clobberSettings(mc, 'allowedIPs', input.allowedIPs));
  }

  if (input.allowedEmailDomains) {
    // It's an array, we can't sensibly merge it.
    actions.push(
      clobberSettings(mc, 'allowedEmailDomains', input.allowedEmailDomains)
    );
  }

  if (input.allowedPhoneNumbers) {
    // It's an array, we can't sensibly merge it.
    actions.push(
      clobberSettings(mc, 'allowedPhoneNumbers', input.allowedPhoneNumbers)
    );
  }

  if (input.requestChecks) {
    actions.push(writeMergedSettings(mc, 'requestChecks', input.requestChecks));
  }

  P.all(actions)
    .catch(function(err) {
      console.error('update failed');
      console.error(err);
    })
    .then(function() {
      mc.end();
    });
});
