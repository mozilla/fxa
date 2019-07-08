/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var actions = require('./actions');

// Keep track of events tied to specific sms number
module.exports = function(limits, now) {
  now = now || Date.now;

  function SMSRecord() {
    this.sms = [];
  }

  SMSRecord.parse = function(object) {
    var rec = new SMSRecord();
    object = object || {};
    rec.rl = object.rl; // timestamp when the account was rate-limited
    rec.sms = object.sms || []; // timestamps when sms were sent
    return rec;
  };

  SMSRecord.prototype.getMinLifetimeMS = function() {
    return limits.smsRateLimitIntervalMs;
  };

  SMSRecord.prototype.isOverSmsLimit = function() {
    this.trimHits(now());
    return this.sms.length > limits.maxSms;
  };

  SMSRecord.prototype.trimHits = function(now) {
    if (this.sms.length === 0) {
      return;
    }
    // xs is naturally ordered from oldest to newest
    // and we only need to keep up to limits.sms + 1

    var i = this.sms.length - 1;
    var n = 0;
    var hit = this.sms[i];
    while (hit > now - limits.smsRateLimitIntervalMs && n <= limits.maxSms) {
      hit = this.sms[--i];
      n++;
    }
    this.sms = this.sms.slice(i + 1);
  };

  SMSRecord.prototype.addHit = function() {
    this.sms.push(now());
  };

  SMSRecord.prototype.isRateLimited = function() {
    return !!(this.rl && now() - this.rl < limits.smsRateLimitIntervalMs);
  };

  SMSRecord.prototype.rateLimit = function() {
    this.rl = now();
    this.sms = [];
  };

  SMSRecord.prototype.retryAfter = function() {
    var rateLimitAfter = Math.ceil(
      ((this.rl || 0) + limits.smsRateLimitIntervalMs - now()) / 1000
    );
    return Math.max(0, rateLimitAfter);
  };

  SMSRecord.prototype.update = function(action) {
    if (actions.isSmsSendingAction(action)) {
      if (this.isRateLimited()) {
        return this.retryAfter();
      }

      this.addHit();

      if (this.isOverSmsLimit()) {
        this.rateLimit();
        return this.retryAfter();
      }
    }

    return 0;
  };

  return SMSRecord;
};
