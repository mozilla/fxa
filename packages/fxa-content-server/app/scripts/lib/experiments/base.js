/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
  An experiment interface that helps organize A/B experiments.
  It helps keep the state, organize testing groups and log experiment metrics.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');
  var Storage = require('lib/storage');
  var Url = require('lib/url');

  var FORCE_GROUP_TYPE = 'forceExperimentGroup';
  var storage = Storage.factory('localStorage');

  function BaseExperiment() {
    // nothing to do.
  }

  _.extend(BaseExperiment.prototype, {
    constructor: BaseExperiment,

    /**
     * Name of the experiment. Used in metrics and view logic.
     */
    _name: null,

    /**
     * Experiment notifications. Used to notify an experiment about something that happened in the view
     */
    notifications: {},

    /**
     * The A/B testing group type, see https://en.wikipedia.org/wiki/A/B_testing for details.
     */
    _groupType: null,

    /**
     * Initialize the experiment
     *
     * @returns {boolean}
     *  Returns 'true' when the experiment successfully initialized. Otherwise 'false'.
     */
    initialize: function (name, options) {
      this._initialized = false;
      // all experiments require these options
      if (! (name &&
             options &&
             options.able &&
             options.metrics &&
             options.notifier &&
             options.user &&
             options.window)) {
        return false;
      }

      this.able = options.able;
      this.extraAbleOptions = options.extraAbleOptions || {};
      this.metrics = options.metrics;
      this._name = name;
      this._notifier = options.notifier;
      this.storage = options.storage || storage;
      this.user = options.user;
      this.window = options.window;

      var abData = {
        // the window parameter will override any ab testing features
        forceExperimentGroup: Url.searchParam(FORCE_GROUP_TYPE, this.window.location.search),
        isMetricsEnabledValue: this.metrics.isCollectionEnabled(),
        uniqueUserId: this.user.get('uniqueUserId')
      };

      abData = _.extend(abData, this.extraAbleOptions);

      this._groupType = this.able.choose(this._name, abData) || null;
      if (! this._groupType) {
        return false;
      }

      this._loggingNamespace = 'experiment.' + this._groupType + '.' + this._name + '.';
      this._storageNamespace = 'experiment.' + this._name;
      this._initialized = true;

      this.saveState('enrolled');

      this.delegateNotifications();

      return true;
    },

    delegateNotifications: function (notifications) {
      // based on delegateEvents from Backbone.View
      if (! (notifications || (notifications = _.result(this, 'notifications')))) {
        return false;
      }

      for (var notificationName in notifications) {
        var method = notifications[notificationName];
        if (_.isString(method)) {
          method = this[notifications[notificationName]];
        }

        if (_.isFunction(method)) {
          this._notifier.on(notificationName, method.bind(this));
        }
      }
    },

    /**
     * Checks the experiment group
     *
     * @method isInGroup
     * @param groupType
     * @returns {boolean}
     */
    isInGroup: function (groupType) {
      return !! (groupType && groupType === this._groupType);
    },

    /**
     * Log an experiment event
     *
     * @method logEvent
     * @param event
     */
    logEvent: function (event) {
      if (this._initialized && event) {
        this.metrics.logEvent(this._loggingNamespace + event);
      }
    },

    /**
     * Saves some 'state' value into experiment storage.
     *
     * State is used to keep track of what happened during the experiment.
     *
     * @param state
     */
    saveState: function (state) {
      if (! state) {
        return false;
      }

      var store = {};
      try {
        store = JSON.parse(this.storage.get(this._storageNamespace)) || {};
      } catch (e) {
        // parse failed
      }

      if (! store[state]) {
        this.logEvent(state);
      }
      store[state] = true;
      this.storage.set(this._storageNamespace, JSON.stringify(store));
    },

    /**
     * Check if the experiment had some state occur
     *
     * @param state
     * @returns {boolean}
     */
    hasState: function (state) {
      if (! state) {
        return null;
      }

      var store = {};

      try {
        store = JSON.parse(this.storage.get(this._storageNamespace)) || {};
      } catch (e) {
        // parse failed
      }
      return store[state] === true;
    }
  });

  /**
   * Create a delegate function that calls saveState with `stateName`.
   * Delegate can be used in an Experiment's `notifications` hash.
   *
   * e.g.:
   *
   * ...
   * notifications: {
   *  'mailcheck.clicked': createSaveStateDelegate('clicked')
   * },
   * ...
   *
   * @method createSaveStateDelegate
   * @param {String} stateName
   * @static
   */
  BaseExperiment.createSaveStateDelegate = function (stateName) {
    return function () {
      this.saveState(stateName);
    };
  };

  BaseExperiment.extend = Backbone.Model.extend;

  module.exports = BaseExperiment;
});
