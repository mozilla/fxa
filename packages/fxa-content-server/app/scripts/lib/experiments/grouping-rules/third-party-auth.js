/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');
const GROUPS = [
  // Treatment branches
  'treatment',
];

// This experiment is disabled by default. If you would like to go through
// the flow, load email-first screen and append query params
// `?forceExperiment=thirdPartyAuth&forceExperimentGroup=treatment`
const ROLLOUT_RATE = 1.0;

module.exports = class ThirdPartyAuth extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'thirdPartyAuth';

    // Easier to set class properties for testability
    this.groups = GROUPS;
    this.rolloutRate = ROLLOUT_RATE;
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
    const { relier } = subject;

    if (!relier) {
      return;
    }

    if (relier.isSync()) {
      return;
    }

    if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
      choice = this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    return choice;
  }
};
