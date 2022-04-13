/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This defines experiment groups the 2FA via push feature. Please reference
 * https://docs.google.com/document/d/16fdARc6MC9XO7FBG9YJ4bpeqhHcv1G3ua0uzeS4EckY/edit#
 *
 */
'use strict';

const BaseGroupingRule = require('./base');
const GROUPS = [
  'control',
  // Treatment branches
  'treatment',
];

// This experiment is disabled by default. If you would like to go through
// the flow, load email-first screen and append query params
// `?forceExperiment=pushLogin&forceExperimentGroup=treatment`
const ROLLOUT_RATE = 0.0;

module.exports = class PushLogin extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'pushLogin';

    // Easier to set class properties for testability
    this.groups = GROUPS;
    this.rolloutRate = ROLLOUT_RATE;
  }

  /**
   * For this experiment, we are doing a staged rollout.`
   *
   * @param {Object} subject data used to decide
   *  @param {Boolean} isSync is this a sync signup?
   * @returns {Any}
   */
  choose(subject = {}) {
    let choice = false;
    const { isSync } = subject;

    // Only enroll for sync users
    if (!isSync) {
      return false;
    }

    // TODO: Find out how Softvision plans to test and verify this in
    // if(this.isTestEmail(subject.account.get('email'))) {
    //   return 'push';
    // }

    if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
      choice = this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    return choice;
  }
};
