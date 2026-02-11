/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
  An experiment interface that helps organize A/B experiments.
  It helps keep the state and log experiment metrics.
 */

import _ from 'underscore';
import Backbone from 'backbone';
import NotifierMixin from 'lib/channels/notifier-mixin';
import Storage from 'lib/storage';

function BaseExperiment() {
  // nothing to do.
}

_.extend(BaseExperiment.prototype, Backbone.Events, {
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
   * The A/B testing group type, usually either `'control'` or `'treatment'`.
   */
  _groupType: null,

  /**
   * Initialize the experiment
   *
   * @param {String} name
   * @param {Object} options
   * @returns {boolean}
   *  Returns 'true' when the experiment successfully initialized. Otherwise 'false'.
   */
  initialize(name, options) {
    this._initialized = false;
    // all experiments require these options
    if (
      !(
        name &&
        options &&
        options.groupType &&
        options.metrics &&
        options.notifier
      )
    ) {
      return false;
    }

    this._groupType = options.groupType;
    this.metrics = options.metrics;
    this._name = name;
    this._notifier = options.notifier;
    this.storage = options.storage || Storage.factory('localStorage');

    this._loggingNamespace = `experiment.${this._groupType}.${this._name}.`;
    this._storageNamespace = `experiment.${this._name}`;
    this._initialized = true;

    this.metrics.logExperiment(name, options.groupType);
    this.saveState('enrolled');

    NotifierMixin.initialize.call(this, {
      notifier: options.notifier,
    });

    return true;
  },

  destroy() {
    this.stopListening();
  },

  /**
   * Log an experiment event
   *
   * @method logEvent
   * @param {String} event
   */
  logEvent(event) {
    if (this._initialized && event) {
      this.metrics.logEvent(this._loggingNamespace + event);
    }
  },

  /**
   * Saves some 'state' value into experiment storage.
   *
   * State is used to keep track of what happened during the experiment.
   *
   * @param {String} state
   * @returns {Boolean|undefined}
   */
  saveState(state) {
    if (!state) {
      return false;
    }

    var store = {};
    try {
      store = JSON.parse(this.storage.get(this._storageNamespace)) || {};
    } catch (e) {
      // parse failed
    }

    if (!store[state]) {
      this.logEvent(state);
    }
    store[state] = true;
    this.storage.set(this._storageNamespace, JSON.stringify(store));
  },

  /**
   * Check if the experiment had some state occur
   *
   * @param {String} state
   * @returns {boolean}
   */
  hasState(state) {
    if (!state) {
      return null;
    }

    var store = {};

    try {
      store = JSON.parse(this.storage.get(this._storageNamespace)) || {};
    } catch (e) {
      // parse failed
    }
    return store[state] === true;
  },
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
 * @returns {Function}
 * @static
 */
BaseExperiment.createSaveStateDelegate = (stateName) => {
  return function () {
    this.saveState(stateName);
  };
};

BaseExperiment.extend = Backbone.Model.extend;

export default BaseExperiment;
