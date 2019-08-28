/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An SignupCodeExperimentMixin factory.
 *
 * @mixin SignupCodeExperimentMixin
 */
import ExperimentMixin from './experiment-mixin';
const EXPERIMENT_NAME = 'signupCode';

/**
 * Creates the mixin
 *
 * @returns {Object} mixin
 */
export default {
  dependsOn: [ExperimentMixin],

  beforeRender() {
    if (this.isInSignupCodeExperiment()) {
      const experimentGroup = this.getSignupCodeExperimentGroup();
      this.createExperiment(EXPERIMENT_NAME, experimentGroup);
    }
  },

  /**
   * Get signup code experiment group
   *
   * @returns {String}
   */
  getSignupCodeExperimentGroup() {
    return this.getExperimentGroup(
      EXPERIMENT_NAME,
      this._getSignupCodeExperimentSubject()
    );
  },

  /**
   * Is the user in the experiment?
   *
   * @returns {Boolean}
   */
  isInSignupCodeExperiment() {
    return this.isInExperiment(
      EXPERIMENT_NAME,
      this._getSignupCodeExperimentSubject()
    );
  },

  /**
   * Get the experiment choice subject
   *
   * @returns {Object}
   * @private
   */
  _getSignupCodeExperimentSubject() {
    const subject = {
      account: this.model.get('account'),
      clientId: this.relier.get('clientId'),
      isSignupCodeSupported: this.broker.getCapability('signupCode'),
      service: this.relier.get('service'),
    };
    return subject;
  },
};
