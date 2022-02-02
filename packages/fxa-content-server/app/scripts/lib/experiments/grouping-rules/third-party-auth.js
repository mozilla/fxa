/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');
const GROUPS = [
  'control',

  // Treatment branches
  'google',
];

// For each client specify which experiment group to show
const ROLLOUT_CONFIG = {
  // 123Done
  dcdb5ae7add825d2: GROUPS,
  // Pocket
  '7377719276ad44ee': GROUPS,
  '749818d3f2e7857f': GROUPS,
};

// This experiment is disabled by default. If you would like to go through
// the flow, load email-first screen and append query params
// `?forceExperiment=thirdPartyAuth&forceExperimentGroup=google`
const ROLLOUT_RATE = 0.0;

module.exports = class ThirdPartyAuth extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'thirdPartyAuth';

    // Easier to set class properties for testability
    this.groups = GROUPS;
    this.rolloutRate = ROLLOUT_RATE;
    this.rolloutConfig = ROLLOUT_CONFIG;
  }

  /**
   * For this experiment, we are doing a staged rollout.
   *
   * @param {Object} subject data used to decide
   *  @param {String} clientId clientId
   * @returns {Any}
   */
  choose(subject = {}) {
    let choice = false;
    const { clientId } = subject;

    if (!clientId) {
      return;
    }

    const clientConfig = this.rolloutConfig[clientId];
    if (!clientConfig) {
      return;
    }

    if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
      choice = this.uniformChoice(clientConfig, subject.uniqueUserId);
    }

    return choice;
  }
};
