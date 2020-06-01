/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const deepEqual = require('deep-equal');
const { initialCapital } = require('../utils');

module.exports = (config, Settings, log) => {
  class Limits extends Settings {
    constructor(settings) {
      super('limits');
      this.setAll(settings);
    }

    setAll(settings) {
      this.blockIntervalSeconds = settings.blockIntervalSeconds;
      this.blockIntervalMs = settings.blockIntervalSeconds * 1000;
      this.suspectIntervalMs = settings.suspectInterval;
      this.disableIntervalMs = settings.disableInterval;
      this.rateLimitIntervalSeconds = settings.rateLimitIntervalSeconds;
      this.rateLimitIntervalMs = settings.rateLimitIntervalSeconds * 1000;
      this.maxEmails = settings.maxEmails;
      this.maxBadLogins = settings.maxBadLogins;
      this.maxBadLoginsPerIp = settings.maxBadLoginsPerIp;
      this.maxBadLoginsPerEmail = settings.maxBadLoginsPerEmail;
      this.maxUnblockAttempts = settings.maxUnblockAttempts;
      this.maxVerifyCodes = settings.maxVerifyCodes;
      this.ipRateLimitIntervalSeconds = settings.ipRateLimitIntervalSeconds;
      this.ipRateLimitIntervalMs = settings.ipRateLimitIntervalSeconds * 1000;
      this.ipRateLimitBanDurationSeconds =
        settings.ipRateLimitBanDurationSeconds;
      this.ipRateLimitBanDurationMs =
        settings.ipRateLimitBanDurationSeconds * 1000;
      this.maxAccountStatusCheck = settings.maxAccountStatusCheck;
      this.badLoginErrnoWeights = settings.badLoginErrnoWeights || {};
      this.uidRateLimit = settings.uidRateLimit || {};
      this.maxChecksPerUid = this.uidRateLimit.maxChecks;
      this.uidRateLimitBanDurationMs =
        this.uidRateLimit.banDurationSeconds * 1000;
      this.uidRateLimitIntervalMs =
        this.uidRateLimit.limitIntervalSeconds * 1000;
      this.smsRateLimit = settings.smsRateLimit || {};
      this.maxSms = settings.smsRateLimit.maxSms;
      this.smsRateLimitIntervalSeconds = this.smsRateLimit.limitIntervalSeconds;
      this.smsRateLimitIntervalMs = this.smsRateLimitIntervalSeconds * 1000;
      this.maxAccountAccess = settings.maxAccountAccess;

      return this;
    }

    validate(settings) {
      if (typeof settings !== 'object') {
        log.error({ op: 'limits.validate.invalid', data: settings });
        throw new Settings.Missing('invalid limits from memcache');
      }
      var keys = Object.keys(config.limits);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var current = this[key];
        var future = settings[key];
        if (typeof current !== typeof future) {
          log.error({
            op: 'limits.validate.err',
            key: key,
            message: 'types do not match',
          });
          settings[key] = current;
        } else if (!deepEqual(current, future)) {
          log.info({
            op: 'limits.validate.changed',
            key,
            [`current${initialCapital(key)}`]: current,
            [`future${initialCapital(key)}`]: future,
          });
        }
      }
      return settings;
    }
  }

  return new Limits(config.limits);
};
