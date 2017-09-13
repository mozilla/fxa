/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Should the user be part of the SMS experiment?
 */
define((require, exports, module) => {
  'use strict';

  const BaseGroupingRule = require('./base');

  const GROUPS = ['control', 'treatment', 'signinCodes'];

  function isEmailInSigninCodesGroup (email) {
    return /@softvision\.(com|ro)$/.test(email) ||
           /@mozilla\.(com|org)$/.test(email);
  }

  module.exports = class SmsGroupingRule extends BaseGroupingRule {
    constructor () {
      super();
      this.name = 'sendSms';
    }

    choose (subject = {}) {
      if (! subject.account || ! subject.uniqueUserId) {
        return false;
      }

      let choice;

      if (isEmailInSigninCodesGroup(subject.account.get('email'))) {
        choice = 'signinCodes';
      } else {
        choice = this.uniformChoice(GROUPS, subject.uniqueUserId);
      }

      return choice;
    }
  };
});
