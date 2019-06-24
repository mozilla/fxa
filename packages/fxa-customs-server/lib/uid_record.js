/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This module keeps track of events related to a specific uid
 */
module.exports = function(limits, now) {
  now = now || Date.now;
  function UidRecord() {
    this.timestampsByAction = {};
    this.rateLimitedTimestamp = undefined;
  }

  UidRecord.parse = function(object) {
    var rec = new UidRecord();
    object = object || {};
    rec.rateLimitedTimestamp = object.rateLimitedTimestamp; // timestamp when the account was rateLimited
    rec.timestampsByAction = object.timestampsByAction || {}; // timestamps on each kind of action
    return rec;
  };

  UidRecord.prototype.getMinLifetimeMS = function() {
    return Math.max(
      limits.uidRateLimitIntervalMs,
      limits.uidRateLimitBanDurationMs
    );
  };

  /*
   * stores check timestamps if account is not blocked.
   * returns remaining time until uid unblick
   */
  UidRecord.prototype.addCount = function(action) {
    var timestamp = now();
    this.trimCounts(action, timestamp);

    if (!this.isRateLimited()) {
      this.timestampsByAction[action].push(timestamp);
    }

    return this.getPossibleRetryDelay(action);
  };

  UidRecord.prototype.trimCounts = function(action, now) {
    this.timestampsByAction[action] = this._trim(
      now,
      this.timestampsByAction[action],
      limits.maxChecksPerUid
    );
  };

  UidRecord.prototype._trim = function(now, items, max) {
    if (!items || items.length === 0) {
      return [];
    }
    // the list is naturally ordered from oldest to newest,
    // and we only need to keep data for up to max+ 1.
    var i = items.length - 1;
    var n = 0;
    var item = items[i];
    while (item > now - limits.uidRateLimitIntervalMs && n < max) {
      item = items[--i];
      n++;
      if (i === -1) {
        break;
      }
    }
    return items.slice(i + 1);
  };

  UidRecord.prototype.rateLimit = function() {
    this.rateLimitedTimestamp = now();
  };

  UidRecord.prototype.getRetryAfter = function() {
    return this.rateLimitedTimestamp + limits.uidRateLimitBanDurationMs - now();
  };

  UidRecord.prototype.isRateLimited = function() {
    //uid is rateLimited if there's a valid rateLimited timestamp and
    //waiting time interval wasn't reached
    return (
      this.rateLimitedTimestamp &&
      this.rateLimitedTimestamp + limits.uidRateLimitBanDurationMs > now()
    );
  };

  UidRecord.prototype.getPossibleRetryDelay = function(action) {
    if (this.timestampsByAction[action].length < limits.maxChecksPerUid) {
      this.rateLimitedTimestamp = undefined;
      return 0;
    } else {
      if (!this.isRateLimited()) {
        // we have more attempts than allowed. rateLimit it
        this.rateLimit();
      }
      return this.getRetryAfter();
    }
  };

  return UidRecord;
};
