/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const deepEqual = require('deep-equal');
const { initialCapital } = require('../utils');

module.exports = (config, Settings, log) => {
  class RequestChecks extends Settings {
    constructor(settings) {
      super('requestChecks');
      this.setAll(settings);
    }

    setAll(settings) {
      this.treatEveryoneWithSuspicion = settings.treatEveryoneWithSuspicion;
      // The private branch puts some additional private config here.
      return this;
    }

    // Type-checks updates to the settings, and merges them
    // with the current values, modying its argument in-place.
    validate(settings) {
      if (typeof settings !== 'object') {
        log.error({ op: 'requestChecks.validate.invalid', data: settings });
        throw new Settings.Missing('invalid requestChecks from memcache');
      }
      const keys = Object.keys(config.requestChecks);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const current = this[key];
        const future = settings[key];
        if (typeof future === 'undefined') {
          settings[key] = current;
        } else if (typeof current !== typeof future) {
          log.error({
            op: 'requestChecks.validate.err',
            key: key,
            message: 'types do not match',
          });
          settings[key] = current;
        } else if (! deepEqual(current, future)) {
          log.info({
            op: 'requestChecks.validate.changed',
            key,
            [`current${initialCapital(key)}`]: current,
            [`future${initialCapital(key)}`]: future,
          });
        }
      }
      return settings;
    }
  }

  return new RequestChecks(config.requestChecks);
};
