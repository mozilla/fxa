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
        able: options.able,
        account: this._account,
        metrics: this.metrics,
        notifications: options.notifications,
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
    isInExperiment: function (experimentName) {
      return this.experiments.isInExperiment(experimentName);
    },

    /**
     * Is the user in an experiment group?
     *
     * @param {String} experimentName
     * @param {String} groupName
     * @return {Boolean}
     */
    isInExperimentGroup: function (experimentName, groupName) {
      return this.experiments.isInExperimentGroup(experimentName, groupName);
    },

    /**
     * Pass along both the data and a reference to the view
     * so the experiment can query the view for any additional info.
     *
     * @param eventName
     * @param data
     */
    notify: function (eventName, data) {
      if (eventName && this.notifications) {
        this.notifications.trigger(eventName, data, this);
      }
    }
  };
});
