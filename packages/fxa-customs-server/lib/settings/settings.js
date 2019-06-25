/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('assert');

const KEY = Symbol();
const POLL_INTERVAL = Symbol();

module.exports = (config, mc, log) => {
  // A sentinel error for signaling that the result was invalid/missing,
  // and we should try to push our own representation to memcached.
  class Missing extends Error {}

  // An abstract class that stores options in memcached.
  //
  // Others extend this class to hotload options from memcached.
  class Settings {
    constructor(key) {
      assert(typeof key === 'string');
      this[KEY] = key;
    }

    // subclasses should provide their own implementation
    setAll(value) {
      return this;
    }

    // subclasses should provide their own implementation
    validate(value) {
      if (value == null) {
        throw new Missing('value was undefined or null');
      }
      return value;
    }

    // Pushes `this` as JSON to `key`
    //
    // Customize what is pushed with a toJSON method.
    push() {
      log.info({ op: this[KEY] + '.push' });
      return mc.setAsync(this[KEY], this, 0).then(() => this.refresh());
    }

    refresh(options) {
      log.info({ op: this[KEY] + '.refresh' });
      let result = mc.getAsync(this[KEY]).then(value => this.validate(value));

      if (options && options.pushOnMissing) {
        result = result.catch(err => {
          if (err instanceof Missing) {
            log.info({ op: this[KEY] + '.refresh.pushOnMissing' });
            return this.push();
          } else {
            throw err;
          }
        });
      }
      return result.then(
        value => this.setAll(value),
        err => {
          log.error({ op: this[KEY] + '.refresh', err: err });
          throw err;
        }
      );
    }

    pollForUpdates() {
      this.stopPolling();
      this[POLL_INTERVAL] = setInterval(() => {
        this.refresh()
          // refresh error should just log, but nothing else
          .catch(() => {});
      }, config.updatePollIntervalSeconds * 1000);
      this[POLL_INTERVAL].unref();
    }

    stopPolling() {
      clearInterval(this[POLL_INTERVAL]);
    }
  }

  Settings.Missing = Missing;

  return Settings;
};
