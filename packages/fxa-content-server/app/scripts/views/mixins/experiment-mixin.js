/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const ExperimentInterface = require('lib/experiment');

  module.exports = {
    initialize (options = {}) {
      this.experiments = options.experiments || new ExperimentInterface({
        account: this._account,
        experimentGroupingRules: options.experimentGroupingRules,
        metrics: this.metrics,
        notifier: options.notifier,
        translator: this.translator,
        user: options.user,
        window: this.window
      });

      this.experiments.chooseExperiments();
    },

    /**
     * Destroy the attached experiments instance.
     */
    destroy () {
      if (this.experiments) {
        this.experiments.destroy();
        this.experiments = null;
      }
    },

    /**
     * Create an experiment and add it to the list of active experiments.
     * Only creates an experiment with `experimentName` once.
     * This is useful to create an experiment that is not created
     * at startup.
     *
     * @param {String} experimentName - name of experiment to create.
     * @param {String} groupType - which group the user is in.
     * @returns {Object} experiment object, if created.
     */
    createExperiment (...args) {
      // force the flow model to be initialized so that
      // the experiment is logged.
      this.notifier.trigger('flow.initialize');

      return this.experiments.createExperiment(...args);
    }
  };

  // Create some delegate methods.
  [
    'getExperimentGroup',
    'isInExperiment',
    'isInExperimentGroup'
  ].forEach((methodName) => {
    module.exports[methodName] = function (...args) {
      return this.experiments[methodName](...args);
    };
  });
});
