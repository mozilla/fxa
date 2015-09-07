/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'underscore',
  'lib/experiments/coppa-view',
  'lib/experiments/mailcheck',
  'lib/experiments/open-gmail',
  'lib/experiments/sync-checkbox',
  'lib/url'
], function (_, CoppaExperiment, MailcheckExperiment, OpenGmailExperiment,
  SyncCheckboxExperiment, Url) {
  'use strict';

  var CHOOSE_ABLE_EXPERIMENT = 'chooseAbExperiment';
  var FORCE_EXPERIMENT_PARAM = 'forceExperiment';
  var UA_OVERRIDE = 'FxATester';

  // all available experiments that must be independent for
  // A/B testing purposes.
  var DEFAULT_EXPERIMENTS = {
    'coppaView': CoppaExperiment,
    'mailcheck': MailcheckExperiment,
    'openGmail': OpenGmailExperiment,
    'syncCheckbox': SyncCheckboxExperiment
  };

  function ExperimentInterface (options) {
    if (! (options &&
           options.able &&
           options.metrics &&
           options.notifications &&
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
    this.notifications = options.notifications;
    this.translator = options.translator;
    this.user = options.user;

    this.initialized = true;
  }

  _.extend(ExperimentInterface.prototype, {}, {
    /**
     * All available independent experiments
     */
    _allExperiments: DEFAULT_EXPERIMENTS,

    /**
     * All active experiments
     */
    _activeExperiments: {},

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
          isMetricsEnabledValue: this.metrics.isCollectionEnabled(),
          uniqueUserId: this.user.get('uniqueUserId'),
          forceExperiment: this.forceExperiment
        });

        var ExperimentConstructor = this._allExperiments[choice];
        if (ExperimentConstructor) {
          var experiment = new ExperimentConstructor();
          var initResult = experiment.initialize(choice , {
            able: this.able,
            account: this.account,
            metrics: this.metrics,
            notifications: this.notifications,
            translator: this.translator,
            user: this.user,
            window: this.window
          });

          // TODO from @shane-tomlinson:
          // Can you leave a note about when initResult could be false? I'm
          // unclear under what circumstances that could happen. Is there
          // a problem if initResult is false, and should that be logged? Would
          // this be an appropriate place to return an error code or string,
          // similar to unix processes? 0/false for "all good", or
          // a code/string for "something is wrong, and here is what."
          //
          // If an experiment fails to initialize, is a default chosen so the
          // user is not left w/ an unresponsive UI? If so, can you document
          // that?
          if (initResult) {
            this._activeExperiments[choice] = experiment;
          }
        }
      }
    }
  });

  return ExperimentInterface;
});
