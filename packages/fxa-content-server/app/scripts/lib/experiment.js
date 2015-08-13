/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'underscore',
  'lib/url',
  'lib/experiments/open-gmail',
  'lib/experiments/mailcheck',
  'lib/experiments/coppa-view',
  'lib/experiments/sync-checkbox'
], function (_, Url, OpenGmailExperiment, MailcheckExperiment, CoppaExperiment, SyncCheckbox) {
  'use strict';

  var UA_OVERRIDE = 'FxATester';
  var CHOOSE_ABLE_EXPERIMENT = 'chooseAbExperiment';
  var FORCE_EXPERIMENT_PARAM = 'forceExperiment';
  // all available experiments that must be independent for A/B testing purposes.
  var DEFAULT_EXPERIMENTS = {
    'openGmail': OpenGmailExperiment,
    'mailcheck': MailcheckExperiment,
    'coppaView': CoppaExperiment,
    'syncCheckbox': SyncCheckbox
  };

  function ExperimentInterface (options) {
    if (! options || ! options.window || ! options.able || ! options.metrics || ! options.user || ! options.notifications) {
      this.initialized = false;
      return;
    }

    this.window = options.window;
    var agent = this.window.navigator.userAgent;
    this.forceExperiment = Url.searchParam(FORCE_EXPERIMENT_PARAM, this.window.location.search);

    // if this is running in functional test mode then we do not want any unpredictable experiments
    if (agent.indexOf(UA_OVERRIDE) >= 0 && ! this.forceExperiment) {
      this.initialized = false;
      return;
    }

    this.able = options.able;
    this.metrics = options.metrics;
    this.user = options.user;
    this.notifications = options.notifications;
    this.account = options.account;
    this.translator = options.translator;
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

    isOptedInTo: function (experiment) {
      return !! this._activeExperiments[experiment];
    },

    isGroup: function (experiment, groupType) {
      if (this.isOptedInTo(experiment)) {
        return this._activeExperiments[experiment].isGroup(groupType);
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
            window: this.window,
            able: this.able,
            metrics: this.metrics,
            user: this.user,
            account: this.account,
            translator: this.translator,
            notifications: this.notifications
          });

          if (initResult) {
            this._activeExperiments[choice] = experiment;
          }
        }
      }
    }
  });

  return ExperimentInterface;
});
