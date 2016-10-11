/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const ExperimentInterface = require('lib/experiment');

  module.exports = {
    initialize (options) {
      options = options || {};

      this.experiments = new ExperimentInterface({
        able: options.able,
        account: this._account,
        metrics: this.metrics,
        notifier: options.notifier,
        user: options.user,
        window: this.window
      });

      this.experiments.chooseExperiments();
    },

    /**
     * Is the user in an experiment?
     *
     * @param {String} experimentName
     * @return {Boolean}
     */
    isInExperiment (experimentName) {
      return this.experiments.isInExperiment(experimentName);
    },

    /**
     * Is the user in an experiment group?
     *
     * @param {String} experimentName
     * @param {String} groupName
     * @return {Boolean}
     */
    isInExperimentGroup (experimentName, groupName) {
      return this.experiments.isInExperimentGroup(experimentName, groupName);
    }
  };
});
