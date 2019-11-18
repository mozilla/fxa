/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import BaseExperiment from './experiments/base';
import Url from './url';

const FORCE_EXPERIMENT_PARAM = 'forceExperiment';
const FORCE_EXPERIMENT_GROUP_PARAM = 'forceExperimentGroup';
const UA_OVERRIDE = 'FxATester';

/**
 * Experiments that are created on startup in `chooseExperiments`.
 */
const STARTUP_EXPERIMENTS = {};

/**
 * Experiments created manually by calling `createExperiment`,
 * after the app has started.
 */
const MANUAL_EXPERIMENTS = {
  // For now, the send SMS experiment only needs to log "enrolled", so
  // no special experiment is created.
  signupCode: BaseExperiment,
  sendSms: BaseExperiment,
  signupPasswordCWTS: BaseExperiment,
  tokenCode: BaseExperiment,
  totp: BaseExperiment,
};

const ALL_EXPERIMENTS = _.extend({}, STARTUP_EXPERIMENTS, MANUAL_EXPERIMENTS);

function ExperimentInterface(options) {
  if (
    !(
      options &&
      options.experimentGroupingRules &&
      options.metrics &&
      options.notifier &&
      options.user &&
      options.window
    )
  ) {
    this.initialized = false;
    return;
  }

  this.window = options.window;

  const search = this.window.location.search;
  this.forceExperiment = Url.searchParam(FORCE_EXPERIMENT_PARAM, search);
  this.forceExperimentGroup = Url.searchParam(
    FORCE_EXPERIMENT_GROUP_PARAM,
    search
  );

  // reset the active experiments so that each instance
  // of the interface creates its own copy of the list.
  this._activeExperiments = {};

  this.account = options.account;
  this.experimentGroupingRules = options.experimentGroupingRules;
  this.metrics = options.metrics;
  this.notifier = options.notifier;
  this.translator = options.translator;
  this.user = options.user;

  const agent = this.window.navigator.userAgent;
  const isWebDriver = this.window.navigator.webdriver;
  // if this is running in functional test mode then we do not want any unpredictable experiments
  if (
    (isWebDriver || agent.indexOf(UA_OVERRIDE) >= 0) &&
    !this.forceExperiment
  ) {
    this.initialized = false;
    return;
  }

  this.initialized = true;
}

_.extend(
  ExperimentInterface.prototype,
  {},
  {
    /**
     * All active experiments
     */
    _activeExperiments: {},

    /**
     * Experiments created on startup
     */
    _startupExperiments: STARTUP_EXPERIMENTS,

    /**
     * All possible experiments
     */
    _allExperiments: ALL_EXPERIMENTS,

    /**
     * Destroy all active experiments.
     */
    destroy() {
      // eslint-disable-next-line no-unused-vars
      for (const expName in this._activeExperiments) {
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
     * @param {Object} [additionalInfo] additional info to pass to the experiment grouping rule.
     * @return {Boolean}
     */
    isInExperiment(experimentName, additionalInfo) {
      // If experimentGroupingRules returns any truthy value, consider the
      // user in the experiment.
      return !!this.getExperimentGroup(experimentName, additionalInfo);
    },

    /**
     * Is the user in an experiment group?
     *
     * @param {String} experimentName
     * @param {String} groupName
     * @param {Object} [additionalInfo] additional info to pass to the experiment grouping rule.
     * @return {Boolean}
     */
    isInExperimentGroup(experimentName, groupName, additionalInfo) {
      return (
        this.getExperimentGroup(experimentName, additionalInfo) === groupName
      );
    },

    /**
     * Use the experiment grouping rule to pick an experiment based on experiment type. Only experiments
     * listed in STARTUP_EXPERIMENTS will be checked.
     *
     * Makes experiment of same independent.
     */
    chooseExperiments() {
      if (!this.initialized) {
        return;
      }

      // eslint-disable-next-line no-unused-vars
      for (const experimentName in this._startupExperiments) {
        const groupType = this.getExperimentGroup(experimentName);

        if (groupType) {
          this.createExperiment(experimentName, groupType);
        }
      }
    },

    /**
     * Create an experiment and add it to the list of active experiments.
     * Only creates an experiment with `experimentName` once.
     *
     * @param {String} experimentName - name of experiment to create.
     * @param {String} groupType - which group the user is in.
     * @returns {Object} experiment object, if created.
     */
    createExperiment(experimentName, groupType) {
      if (this._activeExperiments[experimentName]) {
        // experiment is already created. Bail.
        return this._activeExperiments[experimentName];
      }
      const ExperimentConstructor = this._allExperiments[experimentName];
      if (_.isFunction(ExperimentConstructor)) {
        const experiment = new ExperimentConstructor();
        const initResult = experiment.initialize(experimentName, {
          groupType,
          metrics: this.metrics,
          notifier: this.notifier,
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
          return experiment;
        }
      }
    },

    /**
     * Get the experiment group for `experimentName` the user is in.
     *
     * @param {String} experimentName
     * @param {Object} [additionalInfo] additional info to pass to the experiment grouping rule.
     * @returns {String}
     */
    getExperimentGroup(experimentName, additionalInfo = {}) {
      // can't be in an experiment group if not initialized.
      if (!this.initialized) {
        return false;
      }

      return this.experimentGroupingRules.choose(
        experimentName,
        _.extend(
          {
            account: this.account,
            // yes, this is a hack because experiments do not have a reference
            // to experimentGroupingRules internally. This allows experiments to reference other
            // experiments
            experimentGroupingRules: this.experimentGroupingRules,
            forceExperiment: this.forceExperiment,
            forceExperimentGroup: this.forceExperimentGroup,
            isMetricsEnabledValue: this.metrics.isCollectionEnabled(),
            uniqueUserId: this.user.get('uniqueUserId'),
          },
          additionalInfo
        )
      );
    },
  }
);

export default ExperimentInterface;
