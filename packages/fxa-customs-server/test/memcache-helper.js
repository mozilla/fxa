/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var P = require('bluebird');
var Memcached = require('memcached');
P.promisifyAll(Memcached.prototype);

var config = {
  memcache: {
    address: process.env.MEMCACHE_ADDRESS || '127.0.0.1:11211',
  },
  limits: {
    blockIntervalSeconds: 1,
    rateLimitIntervalSeconds: 1,
    maxAccountStatusCheck: Number(process.env.MAX_ACCOUNT_STATUS_CHECK) || 5,
    maxEmails: 3,
    maxBadLogins: 2,
    maxBadLoginsPerIp: Number(process.env.MAX_BAD_LOGINS_PER_IP) || 3,
    ipRateLimitIntervalSeconds:
      Number(process.env.IP_RATE_LIMIT_INTERVAL_SECONDS) || 60 * 15,
    ipRateLimitBanDurationSeconds:
      Number(process.env.IP_RATE_LIMIT_BAN_DURATION_SECONDS) || 60 * 15,
    smsRateLimit: {
      limitIntervalSeconds:
        Number(process.env.SMS_RATE_LIMIT_INTERVAL_SECONDS) || 60 * 15,
      maxSms: Number(process.env.MAX_SMS) || 2,
    },
    uidRateLimit: {
      limitIntervalSeconds:
        Number(process.env.UID_RATE_LIMIT_INTERVAL_SECONDS) || 60 * 15,
      banDurationSeconds:
        Number(process.env.UID_RATE_LIMIT_BAN_DURATION_SECONDS) || 60 * 15,
      maxChecks: Number(process.env.UID_RATE_LIMIT) || 3,
    },
  },
  requestChecks: {
    treatEveryoneWithSuspicion: false,
  },
};

var mc = new Memcached(config.memcache.address, {
  timeout: 500,
  retries: 1,
  retry: 1000,
  reconnect: 1000,
  idle: 30000,
  namespace: 'fxa~',
});

module.exports.mc = mc;

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';

const Settings = require('../lib/settings/settings')(config, mc, console);
var limits = require('../lib/settings/limits')(config, Settings, console);
var allowedIPs = require('../lib/settings/allowed_ips')(
  config,
  Settings,
  console
);
var allowedEmailDomains = require('../lib/settings/allowed_email_domains')(
  config,
  Settings,
  console
);
const allowedPhoneNumbers = require('../lib/settings/allowed_phone_numbers')(
  config,
  Settings,
  console
);
var requestChecks = require('../lib/settings/requestChecks')(
  config,
  Settings,
  console
);
var EmailRecord = require('../lib/email_record')(limits);
var IpEmailRecord = require('../lib/ip_email_record')(limits);
var IpRecord = require('../lib/ip_record')(limits);

module.exports.limits = limits;

function blockedEmailCheck(cb) {
  setTimeout(
    // give memcache time to flush the writes
    function() {
      mc.get(TEST_EMAIL, function(err, data) {
        var er = EmailRecord.parse(data);
        mc.end();
        cb(er.shouldBlock());
      });
    }
  );
}

module.exports.blockedEmailCheck = blockedEmailCheck;

function blockedIpCheck(cb) {
  setTimeout(
    // give memcache time to flush the writes
    function() {
      mc.get(TEST_IP, function(err, data) {
        var ir = IpRecord.parse(data);
        mc.end();
        cb(ir.shouldBlock());
      });
    }
  );
}

module.exports.blockedIpCheck = blockedIpCheck;

function badLoginCheck() {
  return P.all([
    mc.getAsync(TEST_IP + TEST_EMAIL),
    mc.getAsync(TEST_IP),
    mc.getAsync(TEST_EMAIL),
  ]).spread(function(d1, d2, d3) {
    var ipEmailRecord = IpEmailRecord.parse(d1);
    var ipRecord = IpRecord.parse(d2);
    var emailRecord = EmailRecord.parse(d3);
    mc.end();
    return {
      ipEmailRecord: ipEmailRecord,
      ipRecord: ipRecord,
      emailRecord: emailRecord,
    };
  });
}

module.exports.badLoginCheck = badLoginCheck;

function clearEverything(cb) {
  mc.itemsAsync()
    .then(function(result) {
      var firstServer = result[0];

      // we don't need the "server" key, but the other indicate the slab id's
      var keys = Object.keys(firstServer)
        .filter(k => /[0-9]+/i.test(k))
        .map(Number);

      // get a cachedump for each slabid and slab.number
      var cachedumps = keys
        .map(function(stats) {
          return mc.cachedumpAsync(
            firstServer.server,
            stats,
            firstServer[stats].number
          );
        })
        .map(function(dumpPromise) {
          return dumpPromise.then(function(dump) {
            if (!dump) {
              return;
            }
            // when one key is return as an object pretend it's an array
            if (dump.key && !dump.length) {
              dump = [dump];
            }
            return P.all(
              dump
                .filter(item => /^fxa~/.test(item.key))
                .map(function(item) {
                  return mc.delAsync(item.key.replace(/^fxa~/, ''));
                })
            );
          });
        });

      return P.all(cachedumps);
    })
    .then(function() {
      mc.end();
      cb();
    })
    .catch(cb);
}

module.exports.clearEverything = clearEverything;

function setLimits(settings) {
  var keys = Object.keys(settings);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    limits[k] = settings[k];
  }
  return limits.push().then(function(s) {
    mc.end();
    return s;
  });
}

module.exports.setLimits = setLimits;

function setAllowedIPs(ips) {
  allowedIPs.setAll(ips);
  return allowedIPs.push().then(function(ips) {
    mc.end();
    return ips;
  });
}

module.exports.setAllowedIPs = setAllowedIPs;

function setAllowedEmailDomains(domains) {
  allowedEmailDomains.setAll(domains);
  return allowedEmailDomains.push().then(function(domains) {
    mc.end();
    return domains;
  });
}

module.exports.setAllowedEmailDomains = setAllowedEmailDomains;

function setAllowedPhoneNumbers(phoneNumbers) {
  allowedPhoneNumbers.setAll(phoneNumbers);
  return allowedPhoneNumbers.push().then(phoneNumbers => {
    mc.end();
    return phoneNumbers;
  });
}

module.exports.setAllowedPhoneNumbers = setAllowedPhoneNumbers;

module.exports.setRequestChecks = setRequestChecks;

function setRequestChecks(settings) {
  var keys = Object.keys(settings);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    requestChecks[k] = settings[k];
  }
  return requestChecks.push().then(function(s) {
    mc.end();
    return s;
  });
}

module.exports.setAllowedEmailDomains = setAllowedEmailDomains;
