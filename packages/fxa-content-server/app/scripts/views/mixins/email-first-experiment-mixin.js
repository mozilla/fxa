/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An EmailFirstExperimentMixin factory.
 *
 * EmailFirstMixin is consumed by views that deal with the email-first experiment.
 *
 * @mixin EmailFirstExperimentMixin
 */
import ExperimentMixin from './experiment-mixin';

const EXPERIMENT_NAME = 'emailFirst';

/**
 * Creates the mixin
 *
 * @param {Object} [options={}]
 *   @param {String} [treatmentPathname] pathname to redirect to if the user is in `treatment`
 * @returns {Object} mixin
 */
export default (options = {}) => {
  return {
    dependsOn: [ExperimentMixin],

    beforeRender() {
      if (
        (this.relier.get('action') === 'email' ||
          this.broker.getCapability('disableLegacySigninSignup')) &&
        options.treatmentPathname
      ) {
        this.replaceCurrentPage(options.treatmentPathname);
      } else if (this.isInEmailFirstExperiment()) {
        const experimentGroup = this.getEmailFirstExperimentGroup();
        this.createExperiment(EXPERIMENT_NAME, experimentGroup);
        if (experimentGroup === 'treatment' && options.treatmentPathname) {
          this.replaceCurrentPage(options.treatmentPathname);
        }
      }
    },

    /**
     * Get the email first experiment group
     *
     * @returns {String}
     */
    getEmailFirstExperimentGroup() {
      return this.getExperimentGroup(
        EXPERIMENT_NAME,
        this._getEmailFirstExperimentSubject()
      );
    },

    /**
     * Is the user in the email-first experiment?
     *
     * @returns {Boolean}
     */
    isInEmailFirstExperiment() {
      return this.isInExperiment(
        EXPERIMENT_NAME,
        this._getEmailFirstExperimentSubject()
      );
    },

    /**
     * Is the user in email-first experiment's `groupName` group?
     *
     * @param {String} groupName
     * @returns {Boolean}
     */
    isInEmailFirstExperimentGroup(groupName) {
      return this.isInExperimentGroup(
        EXPERIMENT_NAME,
        groupName,
        this._getEmailFirstExperimentSubject()
      );
    },

    /**
     * Get the email-first experiment choice subject
     *
     * @returns {Object}
     * @private
     */
    _getEmailFirstExperimentSubject() {
      const subject = {
        isEmailFirstSupported: this.broker.getCapability('emailFirst'),
      };
      return subject;
    },
  };
};
