/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An TokenCodeExperimentMixin factory.
 *
 * @mixin TokenCodeExperimentMixin
 */
import ExperimentMixin from './experiment-mixin';
const EXPERIMENT_NAME = 'tokenCode';

/**
 * Creates the mixin
 *
 * @returns {Object} mixin
 */
export default {
  dependsOn: [ExperimentMixin],

  beforeRender() {
    if (this.isInTokenCodeExperiment()) {
      const experimentGroup = this.getTokenCodeExperimentGroup();
      this.createExperiment(EXPERIMENT_NAME, experimentGroup);
    }
  },

  /**
   * Get token code experiment group
   *
   * @returns {String}
   */
  getTokenCodeExperimentGroup() {
    return this.getExperimentGroup(
      EXPERIMENT_NAME,
      this._getTokenCodeExperimentSubject()
    );
  },

  /**
   * Is the user in the token code experiment?
   *
   * @returns {Boolean}
   */
  isInTokenCodeExperiment() {
    return this.isInExperiment(
      EXPERIMENT_NAME,
      this._getTokenCodeExperimentSubject()
    );
  },

  /**
   * Get the token code experiment choice subject
   *
   * @returns {Object}
   * @private
   */
  _getTokenCodeExperimentSubject() {
    const subject = {
      account: this.model.get('account'),
      clientId: this.relier.get('clientId'),
      isTokenCodeSupported: this.broker.getCapability('tokenCode'),
      service: this.relier.get('service'),
    };
    return subject;
  },
};
