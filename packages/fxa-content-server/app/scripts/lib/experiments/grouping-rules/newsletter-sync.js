/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This defines the newsletter sync experiment grouping rules. For more
 * details please reference https://docs.google.com/document/d/1S9Mt83DNHfQHtiuU4m3dLOIyA_FhU5tPHAgJqZkGoCE/edit#.
 */
'use strict';

const BaseGroupingRule = require('./base');
const GROUPS = [
  'control',

  // Treatment branches
  'trailhead-copy',
  'new-copy',
];

// This experiment is disabled by default. If you would like to go through
// the flow, load email-first screen and append query params
// `?forceExperiment=newsletterSync&forceExperimentGroup=new-copy`
const ROLLOUT_RATE = 0.5;

module.exports = class NewsletterSync extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'newsletterSync';

    // Easier to set class properties for testability
    this.groups = GROUPS;
    this.rolloutRate = ROLLOUT_RATE;
  }

  /**
   * For this experiment, we are doing a staged rollout.`
   *
   * @param {Object} subject data used to decide
   *  @param {Boolean} isSync is this a sync signup?
   *  @param {String} lang language of user
   * @returns {Any}
   */
  choose(subject = {}) {
    let choice = false;
    const { isSync, lang } = subject;

    // Only enroll for sync users
    if (!isSync || !lang) {
      return false;
    }

    // Only en users are eligible for experiment
    if (lang.slice(0, 2) !== 'en') {
      return false;
    }

    if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
      choice = this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    return choice;
  }
};
