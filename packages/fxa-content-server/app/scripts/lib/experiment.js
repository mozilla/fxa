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
     * Is the user in an experiment?
     *
     * @param {String} experimentName
     * @return {Boolean}
     */
    isInExperiment (experimentName) {
      // If able returns any truthy value, consider the
      // user in the experiment.
      return !! this.able.choose(experimentName, {
        // yes, this is a hack because experiments do not have a reference
        // to able internally. This allows experiments to reference other
        // experiments
        able: this.able,
        forceExperiment: this.forceExperiment,
        forceExperimentGroup: this.forceExperimentGroup,
        isMetricsEnabledValue: this.metrics.isCollectionEnabled(),
        uniqueUserId: this.user.get('uniqueUserId')
      });
    },

    /**
     * Is the user in an experiment group?
     *
     * @param {String} experimentName
     * @param {String} groupName
     * @return {Boolean}
     */
    isInExperimentGroup (experimentName, groupName) {
      if (this.isInExperiment(experimentName) && this._activeExperiments[experimentName]) {
        return this._activeExperiments[experimentName].isInGroup(groupName);
      }

      return false;
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
        if (this.isInExperiment(experimentName)) {
          this.createExperiment(experimentName);
        }
      }
    },

    /**
     * Create an experiment and add it to the list of active experiments.
     *
     * @param {String} experimentName - name of experiment to create.
     */
    createExperiment (experimentName) {
      const ExperimentConstructor = this._allExperiments[experimentName];
      if (_.isFunction(ExperimentConstructor)) {
        const experiment = new ExperimentConstructor();
        const initResult = experiment.initialize(experimentName, {
          able: this.able,
          account: this.account,
          metrics: this.metrics,
          notifier: this.notifier,
          translator: this.translator,
          user: this.user,
          window: this.window
        });

        /**
         * 'initResult' may be false if the view does not have the
         * required components, such as 'user', or 'account'.
         * Those components are required to make a correct decision
         * about the experiment. 'initialize' does not throw
         * because some experiments only work on particular views.
         *
         * If experiment failed to initialized then do not add it
         * to active experiments. Also if the experiment is not active then the user gets the default view options with no modifications.
         */
        if (initResult) {
          this._activeExperiments[experimentName] = experiment;
          this.metrics.logExperiment(experimentName, experiment._groupType);
        }
      }
    }
  });

  module.exports = ExperimentInterface;
});
