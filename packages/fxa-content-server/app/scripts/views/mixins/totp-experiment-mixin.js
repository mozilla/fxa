/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An TotpExperimentMixin factory.
 *
 * @mixin TotpExperimentMixin
 */
'use strict';

const ExperimentMixin = require('./experiment-mixin');
const EXPERIMENT_NAME = 'totp';

/**
 * Creates the mixin
 *
 * @returns {Object} mixin
 */
module.exports = {
  dependsOn: [ExperimentMixin],

  beforeRender() {
    if (this.isInTotpExperiment()) {
      const experimentGroup = this.getTotpExperimentGroup();
      this.createExperiment(EXPERIMENT_NAME, experimentGroup);
    }
  },

  /**
   * Get TOTP experiment group
   *
   * @returns {String}
   */
  getTotpExperimentGroup() {
    return this.getExperimentGroup(EXPERIMENT_NAME, this._getTotpExperimentSubject());
  },


  /**
   * Is the user in the TOTP experiment?
   *
   * @returns {Boolean}
   */
  isInTotpExperiment() {
    return this.isInExperiment(EXPERIMENT_NAME, this._getTotpExperimentSubject());
  },

  /**
   * Get the TOTP experiment choice subject
   *
   * @returns {Object}
   * @private
   */
  _getTotpExperimentSubject() {
    const subject = {
      account: this.getSignedInAccount(),
      showTwoStepAuthentication: this.broker.getCapability('showTwoStepAuthentication'),
    };
    return subject;
  }
};
