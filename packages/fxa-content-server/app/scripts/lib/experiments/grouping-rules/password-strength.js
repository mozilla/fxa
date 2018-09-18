/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const BaseGroupingRule = require('./base');

const EXPERIMENT_NAME = 'passwordStrength';

class PasswordStrengthExperiment extends BaseGroupingRule {
  constructor () {
    super();
    this.name = EXPERIMENT_NAME;
  }

  choose (subject = {}) {
    return 'designF';
  }
}

PasswordStrengthExperiment.EXPERIMENT_NAME = EXPERIMENT_NAME;

module.exports = PasswordStrengthExperiment;
