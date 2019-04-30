/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An ConnectAnotherServiceExperimentMixin factory.
 *
 * @mixin ConnectAnotherServiceExperimentMixin
 */
'use strict';

const ExperimentMixin = require('./experiment-mixin');
const UserAgentMixin = require('../../lib/user-agent-mixin');
const EXPERIMENT_NAME = 'connectAnotherService';

/**
 * Creates the mixin
 *
 * @returns {Object} mixin
 */
module.exports = {
  dependsOn: [
    ExperimentMixin,
    UserAgentMixin
  ],

  beforeRender() {
    if (this.isInConnectAnotherServiceExperiment()) {
      const experimentGroup = this.getConnectAnotherServiceExperimentGroup();
      this.createExperiment(EXPERIMENT_NAME, experimentGroup);
    }
  },

  /**
   * Get the experiment group
   *
   * @returns {String}
   */
  getConnectAnotherServiceExperimentGroup() {
    return this.getExperimentGroup(EXPERIMENT_NAME, this._getExperimentSubject());
  },


  /**
   * Is the user in the experiment?
   *
   * @returns {Boolean}
   */
  isInConnectAnotherServiceExperiment() {
    return this.isInExperiment(EXPERIMENT_NAME, this._getExperimentSubject());
  },

  /**
   * Get the experiment choice subject
   *
   * @returns {Object}
   * @private
   */
  _getExperimentSubject() {
    const subject = {
      account: this.model.get('account'),
      clientId: this.relier.get('clientId'),
      userAgent: this.getContext()
    };
    return subject;
  }
};
