/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const BaseGroupingRule = require('./base');

const GROUPS = ['control', 'treatment'];

module.exports = class RecoveryKeyGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'recoveryKey';
    this.ROLLOUT_RATE = 0;
  }

  choose(subject) {
    if (! subject || ! subject.account || ! subject.uniqueUserId) {
      return false;
    }

    // Is feature enabled explicitly? ex. from `?showAccountRecovery=true` feature flag?
    if (subject.showAccountRecovery) {
      return 'treatment';
    }

    if (this.isTestEmail(subject.account.get('email'))) {
      return 'treatment';
    }

    // Are they apart of rollout?
    if (this.bernoulliTrial(this.ROLLOUT_RATE, subject.uniqueUserId)) {
      return this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    // Otherwise don't show panel
    return false;
  }
};
