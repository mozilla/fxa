/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class Record {
  constructor(object, config, now = Date.now) {
    object = object || {};
    this.rl = object.rl; // timestamp when the account was rate-limited
    this.hits = object.hits || []; // timestamps when last hit occurred

    Object.defineProperty(this, 'limits', {
      // limits is not saved to memcached
      enumerable: false,
      get() {
        return config.limits;
      },
    });
    Object.defineProperty(this, 'actions', {
      // actions is not saved to memcached
      enumerable: false,
      get() {
        return config.actions;
      },
    });
    this.now = now;
  }

  getMinLifetimeMS() {
    return this.limits.rateLimitIntervalMs;
  }

  isOverLimit() {
    this.trimHits(this.now());
    return this.hits.length > this.limits.max;
  }

  trimHits(now) {
    if (this.hits.length === 0) {
      return;
    }
    // hits is naturally ordered from oldest to newest
    // and we only need to keep up to hit + 1
    const periodMs = this.limits.periodMs;
    const max = this.limits.max;

    let i = this.hits.length - 1;
    let n = 0;
    let hit = this.hits[i];
    while (hit > now - periodMs && n <= max) {
      hit = this.hits[--i];
      n++;
    }
    this.hits = this.hits.slice(i + 1);
  }

  addHit() {
    this.hits.push(this.now());
  }

  isRateLimited() {
    return !! (
      this.rl && this.now() - this.rl < this.limits.rateLimitIntervalMs
    );
  }

  rateLimit() {
    this.rl = this.now();
    this.hits = [];
  }

  retryAfter() {
    const rateLimitIntervalMs = this.limits.rateLimitIntervalMs;
    const rateLimitAfter = Math.ceil(
      ((this.rl || 0) + rateLimitIntervalMs - this.now()) / 1000
    );
    return Math.max(0, rateLimitAfter);
  }

  update(action) {
    if (this.actions.indexOf(action) > -1) {
      if (this.isRateLimited()) {
        return this.retryAfter();
      }

      this.addHit();

      if (this.isOverLimit()) {
        this.rateLimit();
        return this.retryAfter();
      }
    }
    return 0;
  }
}

module.exports = Record;
