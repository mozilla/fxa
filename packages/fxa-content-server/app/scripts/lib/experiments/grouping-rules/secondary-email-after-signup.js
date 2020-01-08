/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');

const EXPERIMENT_NAME = 'secondaryEmailAfterSignup';
const GROUPS = ['control', 'treatment'];

class SecondaryEmailAfterSignup extends BaseGroupingRule {
  constructor() {
    super();
    this.name = EXPERIMENT_NAME;
    this.ROLLOUT_RATE = 0.0;
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject) {
    if (!this._isValidSubject(subject)) {
      return false;
    }

    if (this.bernoulliTrial(this.ROLLOUT_RATE, subject.uniqueUserId)) {
      return this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    return false;
  }

  /**
   * Is the subject valid?
   *
   * @param {Object} subject
   * @returns {Boolean}
   * @private
   */
  _isValidSubject(subject) {
    return !!(subject && subject.uniqueUserId);
  }
}

module.exports = SecondaryEmailAfterSignup;
