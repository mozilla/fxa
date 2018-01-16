/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BaseGroupingRule = require('./base');
  const GROUPS = ['control', 'treatment'];
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
    }

    choose(subject) {
      if (! subject || ! subject.uniqueUserId || ! subject.experimentGroupingRules || ! subject.isTokenCodeSupported) {
        return false;
      }

      const client = ROLLOUT_CLIENTS[subject.clientId];
      if (client && this.bernoulliTrial(client.rolloutRate, subject.uniqueUserId)) {
        return this.uniformChoice(GROUPS, subject.uniqueUserId);
      }

      return false;
    }
  };
});
