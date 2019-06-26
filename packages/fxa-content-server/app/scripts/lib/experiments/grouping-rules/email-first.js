/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');

const EXPERIMENT_NAME = 'emailFirst';

class EmailFirstGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = EXPERIMENT_NAME;
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject) {
    const GROUPS = ['control', 'treatment'];

    if (!this._isValidSubject(subject)) {
      return false;
    } else if (!subject.isEmailFirstSupported) {
      // isEmailFirstSupported is `true` for brokers that support the email-first flow.
      return false;
    } else if (!this._isSampledUser(subject)) {
      return false;
    }

    return this.uniformChoice(GROUPS, subject.uniqueUserId);
  }

  /**
   * Is the subject valid?
   *
   * @param {Object} subject
   * @returns {Boolean}
   * @private
   */
  _isValidSubject(subject) {
    return subject && subject.uniqueUserId && subject.experimentGroupingRules;
  }

  /**
   * Is the user sample the experiment?
   *
   * @param {Object} subject
   * @returns {Boolean}
   * @private
   */
  _isSampledUser(subject) {
    // All users that make it to this point that also report metrics are
    // sampled users.
    return subject.experimentGroupingRules.choose('isSampledUser', subject);
  }
}

module.exports = EmailFirstGroupingRule;
