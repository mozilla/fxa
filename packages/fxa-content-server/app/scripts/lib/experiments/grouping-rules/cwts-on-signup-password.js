/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');

const EXPERIMENT_NAME = 'signupPasswordCWTS';

const GROUPS = ['control', 'treatment'];

const ROLLOUT_RATE = 1;

class CWTSOnSignupPasswordGroupingRule extends BaseGroupingRule {
  constructor(rolloutRate) {
    super();
    this.name = EXPERIMENT_NAME;
    this.forceExperimentAllow = 'signupCode';
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

    if (subject.service !== 'sync') {
      return false;
    }

    const rolloutRate =
      'rolloutRate' in subject ? subject.rolloutRate : ROLLOUT_RATE;

    if (rolloutRate === 0) {
      return false;
    } else if (rolloutRate === 1 || this.isTestEmail(subject.email)) {
      // fully rolled out gets treatment, to allow us to fully
      // roll out treatment to everyone w/ minimal fuss if the
      // experiment is positive.
      return 'treatment';
      // these extra hacky email checks are because there are so many
      // long running experiments in play that using &forceExperiment
      // and &forceExperimentGroup query params cause those tests
      // to not work, e.g., signup codes.
    } else if (/^signupPasswordCWTS\.treatment/.test(subject.email)) {
      return 'treatment';
    } else if (/^signupPasswordCWTS\.control/.test(subject.email)) {
      return 'control';
    } else if (this.bernoulliTrial(rolloutRate, subject.uniqueUserId)) {
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
    return !!(
      subject &&
      subject.email &&
      subject.service &&
      subject.uniqueUserId
    );
  }
}

module.exports = CWTSOnSignupPasswordGroupingRule;
