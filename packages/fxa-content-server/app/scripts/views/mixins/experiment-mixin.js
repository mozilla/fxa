/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mixin to provide experiment related functionality.
 *
 * Expects the view to expose:
 * - either this.getAccount() or this._account
 * - this.metrics
 * - this.translator
 * - this.window
 *
 * @mixin ExperimentMixin
 */
'use strict';

import { isFunction } from 'underscore';
import ExperimentInterface from '../../lib/experiment';

function getAccount () {
  // make no assumptions about the availability of this.getAccount.
  return (isFunction(this.getAccount) && this.getAccount()) || this._account;
}

const ExperimentMixin = {
  initialize (options = {}) {
    this.experiments = options.experiments || this._createExperimentInterface(options);

    this.experiments.chooseExperiments();
  },

  /**
   * Create an ExperimentInterface instance using `options`
   *
   * @param {Object} [options={}]
   * @returns {Object}
   * @private
   */
  _createExperimentInterface (options = {}) {
    return new ExperimentInterface({
      account: getAccount.call(this),
      experimentGroupingRules: options.experimentGroupingRules,
      metrics: this.metrics,
      notifier: options.notifier,
      translator: this.translator,
      user: options.user,
      window: this.window
    });
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
    if (this.experiments) {
      // force the flow model to be initialized so that
      // the experiment is logged.
      this.notifier.trigger('flow.initialize');

      return this.experiments.createExperiment(...args);
    }
  }
};

// Create some delegate methods.
[
  'getExperimentGroup',
  'isInExperiment',
  'isInExperimentGroup'
].forEach((methodName) => {
  ExperimentMixin[methodName] = function (...args) {
    if (this.experiments) {
      return this.experiments[methodName](...args);
    }
  };
});

export default ExperimentMixin;
