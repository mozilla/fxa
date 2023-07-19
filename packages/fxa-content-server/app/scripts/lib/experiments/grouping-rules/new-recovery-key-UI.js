/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Feature flag for new account recovery key UI.
 *
 */
'use strict';

const BaseGroupingRule = require('./base');

const GROUPS = [
  'control',
  // Treatment branch is the new account recovery key creation flow
  'treatment',
];

// This experiment is disabled by default. If you would like to go through
// the flow, load email-first screen and append query params
// `?forceExperiment=newRecoveryKeyUI&forceExperimentGroup=treatment`
const ROLLOUT_RATE = 0.15;

module.exports = class NewRecoveryKeyUI extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'newRecoveryKeyUI';
    this.groups = GROUPS;
    this.rolloutRate = ROLLOUT_RATE;
  }

  /**
   * Enable new recovery key creation flow if user is in the treatment group.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject = {}) {
    let choice = false;

    if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
      choice = this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    return choice;
  }
};
