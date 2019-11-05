/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Should the user be part of the SMS experiment?
 */
'use strict';

const BaseGroupingRule = require('./base');
const CountryTelephoneInfo = require('../../country-telephone-info');

// Countries that are in the process of being rolled out
// have a `control` group so that we can fully compare
// the two treatment groups to the control group.
// Countries that are fully rolled out do not, because
// `control` fares worse.
const GROUPS_FOR_PARTIAL_ROLLOUT = ['control', 'signinCodes'];

module.exports = class SmsGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'sendSms';
  }

  choose(subject = {}) {
    if (! subject.account || ! subject.uniqueUserId || ! subject.country) {
      return false;
    }

    let telephoneInfo = CountryTelephoneInfo[subject.country];
    const { featureFlags } = subject;
    if (featureFlags && featureFlags.smsCountries) {
      telephoneInfo = featureFlags.smsCountries[subject.country];
    }

    if (! telephoneInfo) {
      return false;
    }

    let choice = false;
    // If rolloutRate is not specified, assume 0.
    const rolloutRate = telephoneInfo.rolloutRate || 0;

    if (this.isTestEmail(subject.account.get('email'))) {
      choice = 'signinCodes';
    } else if (rolloutRate >= 1) {
      // country is fully rolled out.
      choice = true;
    } else if (this.bernoulliTrial(rolloutRate, subject.uniqueUserId)) {
      // country is in the process of being rolled out.
      choice = this.uniformChoice(
        GROUPS_FOR_PARTIAL_ROLLOUT,
        subject.uniqueUserId
      );
    }

    return choice;
  }
};
