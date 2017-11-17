/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Are DataDog metrics enabled for the user?
 */
define(function(require, exports, module) {
  'use strict';

  const BaseGroupingRule = require('./base');

  module.exports = class IsSampledUserGroupingRule extends BaseGroupingRule {
    constructor () {
      super();
      this.name = 'isSampledUser';
    }

    choose (subject = {}) {
      const sampleRate = IsSampledUserGroupingRule.sampleRate(subject.env);
      return !! (subject.env && subject.uniqueUserId && this.bernoulliTrial(sampleRate, subject.uniqueUserId));
    }

    /**
     * Return the sample rate for `env`
     *
     * @static
     * @param {String} env
     * @returns {Number}
     */
    static sampleRate (env) {
      return env === 'development' ? 1.0 : 0.1;
    }
  };
});
