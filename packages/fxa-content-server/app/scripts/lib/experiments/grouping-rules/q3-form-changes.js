/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * q3FormChanges is deprecated but kept around so that the experiment name
 * still validate in the weeks after train-112 rolls out.
 * The experiment can be removed in train-113 once the numbers of people
 * reporting q3FormChanges are sufficiently low.
 */
'use strict';

const BaseGroupingRule = require('./base');

module.exports = class Q3FormChanges extends BaseGroupingRule {
  constructor () {
    super();
    this.deprecated = true;
    this.name = 'q3FormChanges';
  }
};
