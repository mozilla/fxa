/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BaseGroupingRule = require('./base');
  const GROUPS = ['control', 'treatment-code', 'treatment-link'];
  const ROLLOUT_CLIENTS = {
    '3a1f53aabe17ba32': {
      name: 'Firefox Add-ons',
      rolloutRate: 0.0 // Rollout rate between 0..1
    },
    'dcdb5ae7add825d2': {
      name: '123Done',
      rolloutRate: 1.0
    },
    'ecdb5ae7add825d4': {
      name: 'TestClient',
      rolloutRate: 0.0
    }
  };

  module.exports = class TokenCodeGroupingRule extends BaseGroupingRule {
    constructor() {
      super();
      this.name = 'tokenCode';
      this.SYNC_ROLLOUT_RATE = 0.054; // 1.8% for each cohort = 5.4% total rollout
    }

    choose(subject) {
      if (! subject || ! subject.uniqueUserId || ! subject.experimentGroupingRules || ! subject.isTokenCodeSupported) {
        return false;
      }

      if (subject.clientId) {
        const client = ROLLOUT_CLIENTS[subject.clientId];
        if (client && this.bernoulliTrial(client.rolloutRate, subject.uniqueUserId)) {
          return this.uniformChoice(GROUPS, subject.uniqueUserId);
        }

        // If a clientId was specified but not defined in the rollout configuration, the default
        // is to disable the experiment for them.
        return false;
      }

      if (this.get && this.get('service') === 'Sync') {
        if (this.bernoulliTrial(this.SYNC_ROLLOUT_RATE, subject.uniqueUserId)) {
          return this.uniformChoice(GROUPS, subject.uniqueUserId);
        }
      }

      return false;
    }
  };
});
