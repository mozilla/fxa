/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var MailcheckExperiment = require('lib/experiments/mailcheck');
  var OpenGmailExperiment = require('lib/experiments/open-gmail');
  var SyncCheckboxExperiment = require('lib/experiments/sync-checkbox');
  var Url = require('lib/url');

  var CHOOSE_ABLE_EXPERIMENT = 'chooseAbExperiment';
  var FORCE_EXPERIMENT_PARAM = 'forceExperiment';
  var UA_OVERRIDE = 'FxATester';

  // all available experiments that must be independent for
  // A/B testing purposes.
  var DEFAULT_EXPERIMENTS = {
    'mailcheck': MailcheckExperiment,
    'openGmail': OpenGmailExperiment,
    'syncCheckbox': SyncCheckboxExperiment
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
    var agent = this.window.navigator.userAgent;
    this.forceExperiment = Url.searchParam(FORCE_EXPERIMENT_PARAM,
        this.window.location.search);

    // if this is running in functional test mode then we do not want any unpredictable experiments
    if (agent.indexOf(UA_OVERRIDE) >= 0 && ! this.forceExperiment) {
      this.initialized = false;
      return;
    }

    this.able = options.able;
    this.account = options.account;
    this.metrics = options.metrics;
    this.notifier = options.notifier;
    this.translator = options.translator;
    this.user = options.user;

    this.initialized = true;
  }

  _.extend(ExperimentInterface.prototype, {}, {
    /**
     * All active experiments
     */
    _activeExperiments: {},

    /**
     * All available independent experiments
     */
    _allExperiments: DEFAULT_EXPERIMENTS,

    /**
     * Is the user in an experiment?
     *
     * @param {String} experimentName
     * @return {Boolean}
     */
    isInExperiment: function (experimentName) {
      return !! this._activeExperiments[experimentName];
    },

    /**
     * Is the user in an experiment group?
     *
     * @param {String} experimentName
     * @param {String} groupName
     * @return {Boolean}
     */
    isInExperimentGroup: function (experimentName, groupName) {
      if (this.isInExperiment(experimentName)) {
        return this._activeExperiments[experimentName].isInGroup(groupName);
      }

      return false;
    },

    /**
     * Use Able to pick an experiment based on experiment type.
     *
     * Makes experiment of same independent.
     */
    chooseExperiments: function () {
      if (this.initialized) {
        var choice = this.able.choose(CHOOSE_ABLE_EXPERIMENT, {
          forceExperiment: this.forceExperiment,
          isMetricsEnabledValue: this.metrics.isCollectionEnabled(),
          uniqueUserId: this.user.get('uniqueUserId')
        });

        var ExperimentConstructor = this._allExperiments[choice];
        if (ExperimentConstructor) {
          var experiment = new ExperimentConstructor();
          var initResult = experiment.initialize(choice , {
            able: this.able,
            account: this.account,
            metrics: this.metrics,
            notifier: this.notifier,
            translator: this.translator,
            user: this.user,
            window: this.window
          });

          /**
           * 'initResult' may be false if the view does not have the require components, such as 'user', or 'account'.
           * Those components are required to make a correct decision about the experiment.
           * 'initialize' does not throw because some experiments only work on particular views.
           *
           * If experiment failed to initialized then do not add it to active experiments.
           * Also if the experiment is not active then the user gets the default view options with no modifications.
           */
          if (initResult) {
            this._activeExperiments[choice] = experiment;
          }
        }
      }
    }
  });

  module.exports = ExperimentInterface;
});
