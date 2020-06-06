/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var actions = require('./actions');

// Keep track of events tied to just email addresses
module.exports = function(limits, now) {
  now = now || Date.now;

  function EmailRecord() {
    this.vc = [];
    this.xs = [];
    this.sms = [];
    this.ub = [];
    this.lf = [];
  }

  EmailRecord.parse = function(object) {
    var rec = new EmailRecord();
    object = object || {};
    rec.bk = object.bk; // timestamp when the account was blocked
    rec.su = object.su; // timestamp when the account was suspected
    rec.di = object.di; // timestamp when the account was disabled
    rec.rl = object.rl; // timestamp when the account was rate-limited
    rec.vc = object.vc || rec.vc; // timestamps when code verifications happened
    rec.xs = object.xs || rec.xs; // timestamps when emails were sent
    rec.sms = object.sms || rec.sms; // timestamps when sms were sent
    rec.lf = object.lf || rec.lf; // timestamps of when login failed
    rec.pr = object.pr; // timestamp of the last password reset
    rec.ub = object.ub || rec.ub;
    return rec;
  };

  EmailRecord.prototype.getMinLifetimeMS = function() {
    return Math.max(limits.rateLimitIntervalMs, limits.blockIntervalMs);
  };

  EmailRecord.prototype.isOverEmailLimit = function() {
    this.trimHits(now());
    return this.xs.length > limits.maxEmails;
  };

  EmailRecord.prototype.trimHits = function(now) {
    if (this.xs.length === 0) {
      return;
    }
    // xs is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxEmails + 1

    var i = this.xs.length - 1;
    var n = 0;
    var hit = this.xs[i];
    while (hit > now - limits.rateLimitIntervalMs && n <= limits.maxEmails) {
      hit = this.xs[--i];
      n++;
    }
    this.xs = this.xs.slice(i + 1);
  };

  EmailRecord.prototype.addHit = function() {
    this.xs.push(now());
  };

  EmailRecord.prototype.isOverVerifyCodes = function() {
    this.trimVerifyCodes(now());
    return this.vc.length > limits.maxVerifyCodes;
  };

  EmailRecord.prototype.trimVerifyCodes = function(now) {
    if (this.vc.length === 0) {
      return;
    }
    // vc is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxVerifyCodes + 1

    var i = this.vc.length - 1;
    var n = 0;
    var hit = this.vc[i];
    while (
      hit > now - limits.rateLimitIntervalMs &&
      n <= limits.maxVerifyCodes
    ) {
      hit = this.vc[--i];
      n++;
    }
    this.vc = this.vc.slice(i + 1);
  };

  EmailRecord.prototype.addVerifyCode = function() {
    this.vc.push(now());
  };

  EmailRecord.prototype.isOverSmsLimit = function() {
    this.trimSmsRequests(now());
    return this.sms.length > limits.maxSms;
  };

  EmailRecord.prototype.trimSmsRequests = function(now) {
    if (this.sms.length === 0) {
      return;
    }
    // sms is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxSms + 1

    var i = this.sms.length - 1;
    var n = 0;
    var hit = this.sms[i];
    while (hit > now - limits.rateLimitIntervalMs && n <= limits.maxSms) {
      hit = this.sms[--i];
      n++;
    }
    this.sms = this.sms.slice(i + 1);
  };

  EmailRecord.prototype.addSmsRequest = function() {
    this.sms.push(now());
  };

  EmailRecord.prototype.addUnblock = function() {
    this.ub.push(now());
  };

  EmailRecord.prototype.canUnblock = function() {
    this.trimUnblocks(now());

    return this.ub.length <= limits.maxUnblockAttempts;
  };

  EmailRecord.prototype.trimUnblocks = function(now) {
    if (this.ub.length === 0) {
      return;
    }
    // ub is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxUnblockAttempts + 1

    var i = this.ub.length - 1;
    var n = 0;
    var ub = this.ub[i];
    while (
      ub > now - limits.rateLimitIntervalMs &&
      n <= limits.maxUnblockAttempts
    ) {
      ub = this.ub[--i];
      n++;
    }
    this.ub = this.ub.slice(i + 1);
  };

  EmailRecord.prototype.shouldBlock = function() {
    return this.isRateLimited() || this.isBlocked() || this.isDisabled();
  };

  EmailRecord.prototype.isRateLimited = function() {
    return !!(this.rl && now() - this.rl < limits.rateLimitIntervalMs);
  };

  EmailRecord.prototype.isBlocked = function() {
    return !!(this.bk && now() - this.bk < limits.blockIntervalMs);
  };

  EmailRecord.prototype.isSuspected = function() {
    return !!(this.su && now() - this.su < limits.suspectIntervalMs);
  };

  EmailRecord.prototype.isDisabled = function() {
    return !!(this.di && now() - this.di < limits.disableIntervalMs);
  };

  EmailRecord.prototype.block = function() {
    this.bk = now();
  };

  EmailRecord.prototype.suspect = function() {
    this.su = now();
  };

  EmailRecord.prototype.disable = function() {
    this.di = now();
  };

  EmailRecord.prototype.rateLimit = function() {
    this.rl = now();
    this.xs = [];
    this.sms = [];
  };

  EmailRecord.prototype.passwordReset = function() {
    this.pr = now();
  };

  EmailRecord.prototype.retryAfter = function() {
    var rateLimitAfter = Math.ceil(
      ((this.rl || 0) + limits.rateLimitIntervalMs - now()) / 1000
    );
    var banAfter = Math.ceil(
      ((this.bk || 0) + limits.blockIntervalMs - now()) / 1000
    );
    return Math.max(0, rateLimitAfter, banAfter);
  };

  EmailRecord.prototype.isOverBadLogins = function() {
    this.trimBadLogins(now());
    return this.lf.length > limits.maxBadLoginsPerEmail;
  };

  EmailRecord.prototype.addBadLogin = function() {
    this.trimBadLogins(now());
    this.lf.push(now());
  };

  EmailRecord.prototype.trimBadLogins = function(now) {
    if (this.lf.length === 0) {
      return;
    }
    // lf is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxBadLoginsPerEmail + 1

    var i = this.lf.length - 1;
    var n = 0;
    var login = this.lf[i];
    while (
      login > now - limits.rateLimitIntervalMs &&
      n <= limits.maxBadLoginsPerEmail
    ) {
      login = this.lf[--i];
      n++;
    }
    this.lf = this.lf.slice(i + 1);
  };

  EmailRecord.prototype.update = function(action, unblock) {
    // Reject immediately if they've been explicitly blocked.
    if (this.isBlocked()) {
      return this.retryAfter();
    }

    if (unblock) {
      this.addUnblock();
    }

    // For code-checking actions, we may need to rate-limit.
    if (actions.isCodeVerifyingAction(action)) {
      // If they're already being blocked then don't count any more hits,
      // and tell them to retry.
      if (this.shouldBlock()) {
        return this.retryAfter();
      }
      this.addVerifyCode();
      if (this.isOverVerifyCodes()) {
        // They're now over the limit, rate-limit and tell them to retry.
        this.rateLimit();
        return this.retryAfter();
      }
    }

    // For email-sending actions, we may need to rate-limit.
    if (actions.isEmailSendingAction(action)) {
      // If they're already being blocked then don't count any more hits,
      // and tell them to retry.
      if (this.shouldBlock()) {
        return this.retryAfter();
      }
      this.addHit();
      if (this.isOverEmailLimit()) {
        // They're now over the limit, rate-limit and tell them to retry.
        this.rateLimit();
        return this.retryAfter();
      }
    }

    // For sms-sending actions, we may need to rate-limit.
    if (actions.isSmsSendingAction(action)) {
      // If they're already being blocked then don't count any more hits,
      // and tell them to retry.
      if (this.shouldBlock()) {
        return this.retryAfter();
      }
      this.addSmsRequest();
      if (this.isOverSmsLimit()) {
        // They're now over the limit, rate-limit and tell them to retry.
        this.rateLimit();
        return this.retryAfter();
      }
    }

    // if over the bad logins, rate limit them and return the block
    if (this.isOverBadLogins()) {
      this.rateLimit();
      return this.retryAfter();
    }

    // Everything else is allowed through.
    return 0;
  };

  return EmailRecord;
};
