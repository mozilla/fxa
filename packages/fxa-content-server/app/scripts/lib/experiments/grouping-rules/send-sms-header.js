/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Should a user that has no devices added to their account see one of
 * the following prompt headers when they go to add one:
 * - "Sync this browser with your phone"
 * - "Would you like to sync your phone?"
 */
'use strict';

const BaseGroupingRule = require('./base');

module.exports = class SendSmsHeaderGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'sendSmsHeader';
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject = {}) {
    const GROUPS = ['syncPhone', 'syncBrowser'];
    return this.uniformChoice(GROUPS, subject.uniqueUserId);
  }
};
