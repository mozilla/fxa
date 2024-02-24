/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');

const GROUPS = ['control', 'v2'];

const DEFAULT_ROLLOUT_RATE = 0.0;

module.exports = class KeyStretchGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'keyStretchV2';
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
