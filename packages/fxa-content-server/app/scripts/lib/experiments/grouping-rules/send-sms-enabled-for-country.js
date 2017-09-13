/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Is SMS enabled for the user's country?
 */
define((require, exports, module) => {
  'use strict';

  const BaseGroupingRule = require('./base');

  function canEmailSendToRo (email) {
    return /@softvision\.(com|ro)$/.test(email) ||
           /@mozilla\.(com|org)$/.test(email);
  }

  const ENABLED_COUNTRY_LIST = [
    'CA',
    'GB',
    'RO',
    'US'
  ];

  const smsEnabledForCountryRegExp = new RegExp(`^(${ENABLED_COUNTRY_LIST.join('|')})$`);

  module.exports = class IsSampledUserGroupingRule extends BaseGroupingRule {
    constructor () {
      super();
      this.name = 'sendSmsEnabledForCountry';
      // This experiment must be allowed if `sendSms` is forced.
      this.forceExperimentAllow = 'sendSms';
      this.ENABLED_COUNTRY_LIST = ENABLED_COUNTRY_LIST;
    }

    choose (subject = {}) {
      if (! subject.account || ! subject.country) {
        return false;
      }

      var sendSmsEnabledForCountry = smsEnabledForCountryRegExp.test(subject.country);
      if (subject.country === 'RO') {
        // only Softvision and Mozilla emails
        // are allowed to send SMS to Romania.
        sendSmsEnabledForCountry = canEmailSendToRo(subject.account.get('email'));
      }

      return sendSmsEnabledForCountry;
    }
  };
});

