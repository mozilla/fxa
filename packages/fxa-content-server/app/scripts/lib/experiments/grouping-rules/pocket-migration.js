/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Feature flag for pocket migration.
 *
 */
'use strict';

const BaseGroupingRule = require('./base');
const GROUPS = [
  // Treatment branch is the migration flow
  'treatment',
];
const POCKET_CLIENTIDS = [
  '7377719276ad44ee', // pocket-mobile
  '749818d3f2e7857f', // pocket-web
];

// This experiment is disabled by default. If you would like to go through
// the flow, load email-first screen and append query params
// `?forceExperiment=pocketMigration&forceExperimentGroup=treatment`
const ROLLOUT_RATE = 1;

module.exports = class PocketMigration extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'pocketMigration';

    // Easier to set class properties for testability
    this.groups = GROUPS;
    this.rolloutRate = ROLLOUT_RATE;
  }

  /**
   * Enable pocket migration flow based on if user is in
   * correct group.
   *
   * @param {Object} subject data used to decide
   *  @param {Boolean} clientId
   * @returns {Any}
   */
  choose(subject = {}) {
    let choice = false;
    const { clientId } = subject;

    // Only enroll for pocket clients
    if (!POCKET_CLIENTIDS.includes(clientId)) {
      return false;
    }

    if (this.bernoulliTrial(this.rolloutRate, subject.uniqueUserId)) {
      choice = this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    return choice;
  }
};

module.exports.POCKET_CLIENTIDS = POCKET_CLIENTIDS;
