/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Is Sentry error reporting enabled for the user?
 */
define((require, exports, module) => {
  'use strict';

  const BaseGroupingRule = require('./base');

  module.exports = class SentryGroupingRule extends BaseGroupingRule {
    constructor () {
      super();
      this.name = 'sentryEnabled';
    }

    choose (subject = {}) {
      const sampleRate = SentryGroupingRule.sampleRate(subject.env);

      return !! (subject.env && subject.uniqueUserId && this.bernoulliTrial(sampleRate, subject.uniqueUserId));
    }

    /**
     * Get the sample rate for `env`
     *
     * @static
     * @param {String} env
     * @returns {Number}
     */
    static sampleRate (env) {
      return env === 'development' ? 1.0 : 0.3;
    }
  };
});
