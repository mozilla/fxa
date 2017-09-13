/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const BaseGroupingRule = require('./base');

  module.exports = class Q3FormChanges extends BaseGroupingRule {
    constructor () {
      super();
      this.name = 'q3FormChanges';
    }

    /**
     * Use `subject` data to make a choice.
     *
     * @param {Object} subject data used to decide
     * @returns {Any}
     */
    choose (subject) {
      const EXPERIMENTS = ['disabledButtonState', 'signupPasswordConfirm', 'emailFirst'];
      if (! subject || ! subject.uniqueUserId) {
        return false;
      }

      return this.uniformChoice(EXPERIMENTS, subject.uniqueUserId);
    }
  };
});
