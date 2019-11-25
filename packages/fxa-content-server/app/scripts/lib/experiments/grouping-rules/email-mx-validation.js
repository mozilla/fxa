/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const BaseGroupingRule = require('./base');

module.exports = class EmailMxValidationGroupRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'emailMxValidation';
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject) {
    if (!subject || !subject.uniqueUserId) {
      return false;
    }

    if (this.bernoulliTrial(0.2, subject.uniqueUserId)) {
      return this.uniformChoice(['control', 'treatment'], subject.uniqueUserId);
    }

    return false;
  }
};
