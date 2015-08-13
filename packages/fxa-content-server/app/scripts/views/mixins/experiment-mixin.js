/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'lib/experiment'
], function (ExperimentInterface) {
  'use strict';

  return {
    initialize: function (options) {
      options = options || {};

      this.notifications = options.notifications;
      this.experiments = new ExperimentInterface({
        window: this.window,
        able: options.able,
        metrics: this.metrics,
        account: this._account,
        user: options.user,
        notifications: options.notifications
      });

      this.experiments.chooseExperiments();
    },

    isInExperiment: function (experimentName) {
      return this.experiments.isOptedInTo(experimentName);
    },

    isInExperimentGroup: function (experimentName, groupName) {
      return this.experiments.isGroup(experimentName, groupName);
    },

    /**
     * Pass along both the data and a reference to the view
     * so the experiment can query the view for any additional info.
     *
     * @param eventName
     * @param data
     */
    experimentTrigger: function (eventName, data) {
      if (eventName && this.notifications) {
        this.notifications.trigger(eventName, data, this);
      }
    }
  };
});
