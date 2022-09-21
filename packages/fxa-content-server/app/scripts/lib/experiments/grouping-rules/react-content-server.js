/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Template file for new grouping rules. To use:
 *
 * 1. Copy TEMPLATE.js to a new grouping rule file.
 * 2. Change `ChangeMeGroupingRule` class name to another name.
 * 3. Change `this.name` from `CHANGE_ME` in the constructor.
 * 4. Fill in the `choose` function.
 * 5. Include the new rule file in index.js.
 * 6. Access in views via `this.experiments.choose('name from 3')`
 *    or `this.isInExperimentGroup('name from 3', 'group name')`.
 */
'use strict';

const BaseGroupingRule = require('./base');

const GROUPS = [
  'control',

  // Treatment branches
  'react',
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
// `?forceExperiment=reactContentServer&forceExperimentGroup=react`
const ROLLOUT_RATE = 0.0;

module.exports = class ReactContentServer extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'reactContentServer';
    this.groups = [ 'control', 'react'];
    this.rolloutRate = ROLLOUT_RATE;
    this.rolloutConfig = ROLLOUT_CONFIG;
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject) {
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
