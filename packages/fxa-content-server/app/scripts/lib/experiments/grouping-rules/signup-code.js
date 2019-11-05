/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');

module.exports = class SignupCodeGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'signupCode';
  }

  choose(subject) {
    if (
      ! subject ||
      ! subject.uniqueUserId ||
      ! subject.experimentGroupingRules ||
      ! subject.isSignupCodeSupported
    ) {
      return false;
    }

    return 'treatment';
  }
};
