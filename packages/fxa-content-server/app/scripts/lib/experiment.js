/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const ConnectAnotherDeviceExperiment = require('lib/experiments/connect-another-device');
  const Url = require('lib/url');

  const FORCE_EXPERIMENT_PARAM = 'forceExperiment';
  const FORCE_EXPERIMENT_GROUP_PARAM = 'forceExperimentGroup';
  const UA_OVERRIDE = 'FxATester';

  const ALL_EXPERIMENTS = {
    'connectAnotherDevice': ConnectAnotherDeviceExperiment
  };

  function ExperimentInterface (options) {
    if (! (options &&
           options.able &&
           options.metrics &&
           options.notifier &&
           options.user &&
           options.window)) {
      this.initialized = false;
      return;
    }

    this.window = options.window;

    const search = this.window.location.search;
    this.forceExperiment = Url.searchParam(FORCE_EXPERIMENT_PARAM, search);
    this.forceExperimentGroup = Url.searchParam(FORCE_EXPERIMENT_GROUP_PARAM, search);

    // reset the active experiments so that each instance
    // of the interface creates its own copy of the list.
    this._activeExperiments = {};

    this.able = options.able;
    this.account = options.account;
    this.metrics = options.metrics;
    this.notifier = options.notifier;
    this.translator = options.translator;
    this.user = options.user;

    const agent = this.window.navigator.userAgent;
    // if this is running in functional test mode then we do not want any unpredictable experiments
    if (agent.indexOf(UA_OVERRIDE) >= 0 && ! this.forceExperiment) {
      this.initialized = false;
      return;
    }

    this.initialized = true;
  }

  _.extend(ExperimentInterface.prototype, {}, {
    /**
     * All active experiments
     */
    _activeExperiments: {},

    /**
     * All possible experiments
     */
    _allExperiments: ALL_EXPERIMENTS,

    /**
     * Destory all active experiments.
     */
    destroy () {
      for (let expName in this._activeExperiments) {
        const experiment = this._activeExperiments[expName];
        experiment.destroy();
        this._activeExperiments[expName] = null;
        delete this._activeExperiments[expName];
      }
    },

    /**
     * Is the user in an experiment?
     *
     * @param {String} experimentName
     * @return {Boolean}
     */
    isInExperiment (experimentName) {
      // If able returns any truthy value, consider the
      // user in the experiment.
      return !! this._getExperimentGroup(experimentName);
    },

    /**
     * Is the user in an experiment group?
     *
     * @param {String} experimentName
     * @param {String} groupName
     * @return {Boolean}
     */
    isInExperimentGroup(experimentName, groupName) {
      return this._getExperimentGroup(experimentName) === groupName;
    },

    /**
     * Use Able to pick an experiment based on experiment type.
     *
     * Makes experiment of same independent.
     */
    chooseExperiments () {
      if (! this.initialized) {
        return;
      }

      for (const experimentName in this._allExperiments) {
        const groupType = this._getExperimentGroup(experimentName);

        if (groupType) {
          this.createExperiment(experimentName, groupType);
        }
      }
    },

    /**
     * Create an experiment and add it to the list of active experiments.
     *
     * @param {String} experimentName - name of experiment to create.
     * @param {String} groupType - which group the user is in.
     */
    createExperiment (experimentName, groupType) {
      const ExperimentConstructor = this._allExperiments[experimentName];
      if (_.isFunction(ExperimentConstructor)) {
        const experiment = new ExperimentConstructor();
        const initResult = experiment.initialize(experimentName, {
          groupType,
          metrics: this.metrics,
          notifier: this.notifier
        });

        /**
         * 'initResult' may be false if the view does not have the
         * required components, such as `notifier`.
         *
         * If experiment failed to initialized then do not add it
         * to active experiments. Also if the experiment is not
         * active then the user gets the default view options with
         * no modifications.
         */
        if (initResult) {
          this._activeExperiments[experimentName] = experiment;
        }
      }
    },

    /**
     * Get the experiment group for `experimentName` the user is in.
     *
     * @param {String} experimentName
     * @returns {String}
     * @private
     */
    _getExperimentGroup(experimentName) {
      // can't be in an experiment group if not initialized.
      if (! this.initialized) {
        return false;
      }

      return this.able.choose(experimentName, {
        // yes, this is a hack because experiments do not have a reference
        // to able internally. This allows experiments to reference other
        // experiments
        able: this.able,
        account: this.account,
        forceExperiment: this.forceExperiment,
        forceExperimentGroup: this.forceExperimentGroup,
        isMetricsEnabledValue: this.metrics.isCollectionEnabled(),
        uniqueUserId: this.user.get('uniqueUserId')
      });
    }
  });

  module.exports = ExperimentInterface;
});
