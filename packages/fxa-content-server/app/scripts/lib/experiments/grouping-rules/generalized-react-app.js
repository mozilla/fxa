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

  // Treatment branches.
  // This one is for users who will see the React version of content-server pages
  'react',
];

/* This experiment is disabled by default. If you would like to see the React pages, make sure
 * 1) your local config is set up to enable feature flags for the set of routes you're interested
 * in and either 2a) append `showReactApp=true` to the URL _or_ 2b) to see it in a flow, append
 * the following query params to the page that will navigate to the page you're interested in:
 * `?forceExperiment=generalizedReactApp&forceExperimentGroup=react` */
const DEFAULT_ROLLOUT_RATE = 0.0;

module.exports = class GeneralizedReactApp extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'generalizedReactApp';
    this.groups = GROUPS;
    this.rolloutRate = DEFAULT_ROLLOUT_RATE;
  }

  setRolloutRate(rate) {
    this.rolloutRate = rate;
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject) {
    let choice = false;

    if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
      choice = this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    return choice;
  }
};
