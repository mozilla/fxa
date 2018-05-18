/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');
const GROUPS = ['control', 'treatment'];
const ENABLED_EMAIL_REGEX = /(.+@mozilla\.(com|org)$)|(.+@softvision\.(com|ro)$)/;

module.exports = class TotpGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'totp';
    this.ROLLOUT_RATE = 0.10;
  }

  choose(subject) {
    if (! subject || ! subject.account || ! subject.uniqueUserId) {
      return false;
    }

    // Is feature enabled explicitly? ex. from `?showTwoStepAuthentication=true` feature flag?
    if (subject.showTwoStepAuthentication) {
      return true;
    }

    // Is this a Mozilla/Softvision based email?
    const email = subject.account.get('email');
    if (ENABLED_EMAIL_REGEX.test(email)) {
      return true;
    }

    // Are they apart of rollout?
    if (this.bernoulliTrial(this.ROLLOUT_RATE, subject.uniqueUserId)) {
      return this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    // Otherwise don't show panel
    return false;
  }
};
