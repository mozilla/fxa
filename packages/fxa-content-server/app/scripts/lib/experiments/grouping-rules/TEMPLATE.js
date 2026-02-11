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

module.exports = class ChangeMeGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'CHANGE_ME';
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   * @returns {Any}
   */
  choose(subject) {
    // Fill in decision logic here.
    return true;
  }
};
