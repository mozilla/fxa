/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Should the user be part of the Connect Another Service
 */
'use strict';

const BaseGroupingRule = require('./base');

module.exports = class ConnectAnotherServiceGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'connectAnotherService';
    this.ROLLOUT_RATE = 0.0;
  }

  choose(subject = {}) {
    if (! subject.account || ! subject.uniqueUserId || ! subject.userAgent) {
      return false;
    }

    const {
      canSignIn,
      isFirefoxAndroid,
      isFirefoxIos,
      isOtherAndroid,
      isOtherIos,
    } = subject.userAgent;

    if (this.isTestEmail(subject.account.get('email'))) {
      return true;
    } else if (! canSignIn && (isFirefoxAndroid || isFirefoxIos || isOtherAndroid || isOtherIos)) {
      if (this.bernoulliTrial(this.ROLLOUT_RATE, subject.uniqueUserId)) {
        return true;
      }
    }

    return false;
  }
};
