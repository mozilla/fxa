/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This defines the CAD via QR code experiment grouping rules. For more
 * details please reference https://docs.google.com/document/d/1JfHd-zX47af-seUToS6fHSzpcTKG5l1WFiojGLUQYYE/edit#.
 */
'use strict';

const BaseGroupingRule = require('./base');
const CountryTelephoneInfo = require('../../country-telephone-info');

const GROUPS = [
  'control', // Current sms experience
  'treatment-a', // CAD via QR design in https://mozilla.invisionapp.com/share/N2X6MA9SPD5
  'treatment-b', // Screen displayed in non-sms markets
];

const ROLLOUT_RATE = 0.0;

module.exports = class QrCodeCad extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'qrCodeCad';

    // Easier to set class properties for testability
    this.groups = GROUPS;
    this.rolloutRate = ROLLOUT_RATE;
  }

  /**
   * For this experiment, we are doing a staged rollout.
   *
   * @param {Object} subject data used to decide
   *  @param {Boolean} isSync is this a sync signup?
   * @returns {Any}
   */
  choose(subject = {}) {
    if (!subject.account || !subject.uniqueUserId || !subject.country) {
      return false;
    }

    if (
      subject.experimentGroupingRules.choose('newsletterCadChooser') !==
      this.name
    ) {
      return false;
    }

    let telephoneInfo = CountryTelephoneInfo[subject.country];
    const { featureFlags } = subject;
    if (featureFlags && featureFlags.smsCountries) {
      telephoneInfo = featureFlags.smsCountries[subject.country];
    }

    // Countries that don't support SMS can't be in the experiment
    if (!telephoneInfo) {
      return false;
    }

    let choice = false;
    // If countryRollOut is not specified, assume 0.
    const countryRollOut = telephoneInfo.rolloutRate || 0;

    if (this.isTestEmail(subject.account.get('email'))) {
      // Test users always get the new experience
      choice = 'treatment-a';
    } else if (countryRollOut >= 1) {
      // This experiment should only be shown to countries that are fully
      // rolled out with sms
      if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
        choice = this.uniformChoice(this.groups, subject.uniqueUserId);
      }
    }

    return choice;
  }
};
