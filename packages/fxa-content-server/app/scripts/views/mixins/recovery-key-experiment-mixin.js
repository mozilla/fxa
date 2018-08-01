/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An RecoveryKeyExperimentMixin factory.
 *
 * @mixin RecoveryKeyExperimentMixin
 */
import ExperimentMixin from './experiment-mixin';

const EXPERIMENT_NAME = 'recoveryKey';

/**
 * Creates the mixin
 *
 * @returns {Object} mixin
 */
module.exports = {
  dependsOn: [ExperimentMixin],

  beforeRender() {
    if (this.isInRecoveryKeyExperiment()) {
      const experimentGroup = this.getRecoveryKeyExperimentGroup();
      this.createExperiment(EXPERIMENT_NAME, experimentGroup);
    }
  },

  /**
   * Get RecoveryKey experiment group
   *
   * @returns {String}
   */
  getRecoveryKeyExperimentGroup() {
    return this.getExperimentGroup(EXPERIMENT_NAME, this._getRecoveryKeyExperimentSubject());
  },


  /**
   * Is the user in the RecoveryKey experiment?
   *
   * @returns {Boolean}
   */
  isInRecoveryKeyExperiment() {
    return this.isInExperiment(EXPERIMENT_NAME, this._getRecoveryKeyExperimentSubject());
  },

  /**
   * Get the RecoveryKey experiment choice subject
   *
   * @returns {Object}
   * @private
   */
  _getRecoveryKeyExperimentSubject() {
    const subject = {
      account: this.getSignedInAccount(),
      showTwoStepAuthentication: this.broker.getCapability('showAccountRecovery'),
    };
    return subject;
  }
};
