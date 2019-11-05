/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var actions = require('./actions');

// Keep track of events related to just IP addresses
module.exports = function(limits, now) {
  now = now || Date.now;

  var ERRNO_THROTTLED = 114;

  function IpRecord() {
    this.lf = [];
    this.vc = [];
    this.as = [];
  }

  IpRecord.parse = function(object) {
    var rec = new IpRecord();
    object = object || {};
    rec.bk = object.bk; // timestamp when the IP address was blocked
    rec.su = object.su; // timestamp when the IP address was suspected
    rec.di = object.di; // timestamp when the IP address was disabled
    rec.lf = object.lf || []; // timestamp+email+errno when failed login attempts occurred
    rec.vc = object.vc || []; // timestamp+email when code verifications occurred
    rec.as = object.as || []; // timestamp+email when account status checks occurred
    rec.sms = object.sms || []; // timestamp+sms when sms sent
    rec.aa = object.aa || []; // timestamp when account access was attempted
    rec.rl = object.rl; // timestamp when the IP address was rate-limited
    return rec;
  };

  IpRecord.prototype.getMinLifetimeMS = function() {
    return Math.max(
      limits.blockIntervalMs,
      limits.ipRateLimitIntervalMs,
      limits.ipRateLimitBanDurationMs
    );
  };

  IpRecord.prototype.isOverBadLogins = function() {
    this.trimBadLogins(now());
    // IPs are limited based on the number of unique email
    // addresses they access.  Sum the highest-weighted
    // bad-login event for each user account to determine
    // the overall bad-logins score.
    var weights = {};
    this.lf.forEach(function(info) {
      var user = info.u;
      var errno = info.e;
      weights[user] = Math.max(
        limits.badLoginErrnoWeights[errno] || 1,
        weights[user] || 0
      );
    });
    var total = 0;
    Object.keys(weights).forEach(function(user) {
      total += weights[user];
    });
    return total > limits.maxBadLoginsPerIp;
  };

  IpRecord.prototype.addBadLogin = function(info) {
    info = info || {};
    var t = now();
    var email = info.email || '';
    var errno = info.errno || 999;
    this.trimBadLogins(t);
    this.lf.push({ t: t, e: Number(errno), u: email });
  };

  IpRecord.prototype.trimBadLogins = function(now) {
    this.lf = this._trim(now, this.lf, limits.maxBadLoginsPerIp);
  };

  IpRecord.prototype.isOverVerifyCodes = function() {
    this.trimVerifyCodes(now());
    // Limit based on number of unique emails accessed by this IP.
    var count = 0;
    var seen = {};
    this.vc.forEach(function(info) {
      if (! (info.u in seen)) {
        count += 1;
        seen[info.u] = true;
      }
    });
    return count > limits.maxVerifyCodes;
  };

  IpRecord.prototype.addVerifyCode = function(info) {
    info = info || {};
    var t = now();
    var email = info.email || '';
    this.trimVerifyCodes(t);
    this.vc.push({ t: t, u: email });
  };

  IpRecord.prototype.trimVerifyCodes = function(now) {
    this.vc = this._trim(now, this.vc, limits.maxVerifyCodes);
  };

  IpRecord.prototype.isOverAccountStatusCheck = function() {
    this.trimAccountStatus(now());
    // Limit based on number of unique emails checked by this IP.
    var count = 0;
    var seen = {};
    this.as.forEach(function(info) {
      if (! (info.u in seen)) {
        count += 1;
        seen[info.u] = true;
      }
    });
    return count > limits.maxAccountStatusCheck;
  };

  IpRecord.prototype.addAccountStatusCheck = function(info) {
    info = info || {};
    var t = now();
    var email = info.email || '';
    this.trimAccountStatus(t);
    this.as.push({ t: t, u: email });
  };

  IpRecord.prototype.trimAccountStatus = function(now) {
    this.as = this._trim(now, this.as, limits.maxAccountStatusCheck);
  };

  IpRecord.prototype.isOverSmsLimit = function() {
    this.trimSmsRequests(now());
    return this.sms.length > limits.maxSms;
  };

  IpRecord.prototype.addSmsRequest = function() {
    this.sms.push(now());
  };

  IpRecord.prototype.trimSmsRequests = function(now) {
    if (this.sms.length === 0) {
      return;
    }
    // xs is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxSms + 1

    var i = this.sms.length - 1;
    var n = 0;
    var hit = this.sms[i];

    // Remove non-numbers and expired entries from list
    while (hit > now - limits.ipRateLimitIntervalMs && n <= limits.maxSms) {
      hit = this.sms[--i];
      n++;
    }
    this.sms = this.sms.slice(i + 1);
  };

  IpRecord.prototype.addAccountAccess = function() {
    this.aa.push(now());
  };

  IpRecord.prototype.isOverAccountAccessLimit = function() {
    return this.aa.length > limits.maxAccountAccess;
  };

  IpRecord.prototype._trim = function(now, items, maxUnique) {
    if (items.length === 0) {
      return items;
    }
    // the list is naturally ordered from oldest to newest,
    // and we only need to keep data for up to maxUnique + 1 unique emails.
    var i = items.length - 1;
    var n = 0;
    var seen = {};
    var item = items[i];
    while (item.t > now - limits.ipRateLimitIntervalMs && n <= maxUnique) {
      if (! (item.u in seen)) {
        seen[item.u] = true;
        n++;
      }
      item = items[--i];
      if (i === -1) {
        break;
      }
    }
    return items.slice(i + 1);
  };

  IpRecord.prototype.shouldBlock = function() {
    return this.isBlocked() || this.isDisabled() || this.isRateLimited();
  };

  IpRecord.prototype.isBlocked = function() {
    return !! (this.bk && now() - this.bk < limits.blockIntervalMs);
  };

  IpRecord.prototype.isSuspected = function() {
    return !! (this.su && now() - this.su < limits.suspectIntervalMs);
  };

  IpRecord.prototype.isDisabled = function() {
    return !! (this.di && now() - this.di < limits.disableIntervalMs);
  };

  IpRecord.prototype.isRateLimited = function() {
    return !! (this.rl && now() - this.rl < limits.ipRateLimitBanDurationMs);
  };

  IpRecord.prototype.block = function() {
    this.bk = now();
  };

  IpRecord.prototype.suspect = function() {
    this.su = now();
  };

  IpRecord.prototype.disable = function() {
    this.di = now();
  };

  IpRecord.prototype.rateLimit = function() {
    this.rl = now();
    this.as = [];
    this.sms = [];
    this.aa = [];
  };

  IpRecord.prototype.retryAfter = function() {
    var rateLimitAfter = Math.ceil(
      ((this.rl || 0) + limits.ipRateLimitBanDurationMs - now()) / 1000
    );
    var banAfter = Math.ceil(
      ((this.bk || 0) + limits.blockIntervalMs - now()) / 1000
    );
    return Math.max(0, rateLimitAfter, banAfter);
  };

  IpRecord.prototype.update = function(action, email) {
    // ip block is explicit, no escape hatches
    if (this.isBlocked()) {
      return this.retryAfter();
    }

    // Increment account-status-check count and throttle if needed
    if (actions.isAccountStatusAction(action)) {
      this.addAccountStatusCheck({ email: email });
      if (this.isOverAccountStatusCheck()) {
        // If you do more checks while rate-limited, this can extend the ban.
        this.rateLimit();
      }
    }

    // Increment verify-code-check count and throttle if needed
    if (actions.isCodeVerifyingAction(action)) {
      this.addVerifyCode({ email: email });
      if (this.isOverVerifyCodes()) {
        // If you do more checks while rate-limited, this can extend the ban.
        this.rateLimit();
      }
    }

    // Increment password-check count and throttle if needed
    if (actions.isPasswordCheckingAction(action)) {
      if (this.isRateLimited() || this.isOverBadLogins()) {
        // If we block an attempt, it still counts as a bad login.
        this.addBadLogin({ email: email, errno: ERRNO_THROTTLED });
      }
      if (this.isOverBadLogins()) {
        // If you attempt more logins while rate-limited, this can extend the ban.
        this.rateLimit();
      }
    }

    // Increment sms request count and throttle if needed
    if (actions.isSmsSendingAction(action)) {
      this.addSmsRequest();
      if (this.isOverSmsLimit()) {
        // If you do more than the limit this can extend the ban.
        this.rateLimit();
      }
    }

    if (actions.isAccountAccessAction(action)) {
      this.addAccountAccess();
      if (this.isOverAccountAccessLimit()) {
        this.rateLimit();
      } else {
        // Ignore the `rl` flag if we're not past the threshold for this action
        // because it's sometimes set by allow-listed email addresses in /check,
        // but we have no email address to allow-list against in this case.
        return 0;
      }
    }

    return this.retryAfter();
  };

  return IpRecord;
};
