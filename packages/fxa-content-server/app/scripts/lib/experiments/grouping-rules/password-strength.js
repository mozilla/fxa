/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const BaseGroupingRule = require('./base');

const GROUPS_FOR_PARTIAL_ROLLOUT = ['control', 'designF'];
const ROLLOUT_RATE = 0.1;

const EXPERIMENT_NAME = 'passwordStrength';

class PasswordStrengthExperiment extends BaseGroupingRule {
  constructor () {
    super();
    this.ROLLOUT_RATE = ROLLOUT_RATE;
    this.name = EXPERIMENT_NAME;
  }

  choose (subject = {}) {
    if (! subject.account || ! subject.uniqueUserId || ! subject.lang) {
      return false;
    }

    if (this.isTestEmail(subject.account.get('email'))) {
      return 'designF';
    }

    if (! /^en/.test(subject.lang)) {
      // Unless a tester, only available to english right now.
      return false;
    }

    if (this.bernoulliTrial(this.ROLLOUT_RATE, subject.uniqueUserId)) {
      return this.uniformChoice(GROUPS_FOR_PARTIAL_ROLLOUT, subject.uniqueUserId);
    }

    return false;
  }
}

PasswordStrengthExperiment.EXPERIMENT_NAME = EXPERIMENT_NAME;

module.exports = PasswordStrengthExperiment;
