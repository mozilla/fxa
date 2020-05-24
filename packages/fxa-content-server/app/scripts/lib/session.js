/* eslint-disable no-prototype-builtins */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Session saves session information about the user. Data is automatically
// saved to sessionStorage and automatically loaded from sessionStorage on startup.

import _ from 'underscore';

var NAMESPACE = '__fxa_session';

// these keys will be persisted to localStorage so that they live between browser sessions
var PERSIST_TO_LOCAL_STORAGE = ['oauth'];

function Session() {
  this.load();
}

Session.prototype = {
  /**
   * Load info from sessionStorage
   * @method load
   * @returns {Object}
   */
  load() {
    var values = {};

    // Try parsing sessionStorage values
    try {
      values = _.extend(values, JSON.parse(sessionStorage.getItem(NAMESPACE)));
    } catch (e) {
      // ignore the parse error.
    }

    // Try parsing localStorage values
    try {
      values = _.extend(values, JSON.parse(localStorage.getItem(NAMESPACE)));
    } catch (e) {
      // ignore the parse error.
    }

    // Update new values, without overwriting items on the prototype.
    _.each(
      values,
      function (value, key) {
        // eslint-disable-next-line no-prototype-builtins
        if (!Session.prototype.hasOwnProperty(key)) {
          this[key] = value;
        }
      },
      this
    );

    return values;
  },

  /**
   * Reload in-memory values based on what's currently in storage.
   * This method can be used to pull in any changes to localStorage
   * made by other tabs.  Note that it will remove items from the session
   * if they no longer appear in sessionStorage or localStorage.
   * @method reload
   */
  reload() {
    var values = this.load();
    // Clear values that no longer exist in storage.
    _.each(
      this,
      function (value, key) {
        if (!Session.prototype.hasOwnProperty(key)) {
          if (!values.hasOwnProperty(key)) {
            this[key] = null;
            delete this[key];
          }
        }
      },
      this
    );
  },

  /**
   * Set data.
   * Note: items with keys in Session.prototype cannot be overwritten.
   *
   * @method set
   * @param {Object|String} key - can take either a key/value pair or a dictionary of key/value pairs.
   * @param {String} [value]
   * @returns {undefined}
   */
  set(key, value) {
    if (typeof value === 'undefined' && typeof key === 'object') {
      return _.each(
        key,
        function (value, key) {
          this.set(key, value);
        },
        this
      );
    }

    // don't overwrite any items on the prototype.
    if (!Session.prototype.hasOwnProperty(key)) {
      this[key] = value;
      this.persist();
    }
  },

  /**
   * Persist data to sessionStorage or localStorage
   * @method persist
   */
  persist() {
    // items on the blacklist do not get saved to sessionStorage.
    var toSaveToSessionStorage = {};
    var toSaveToLocalStorage = {};
    _.each(this, function (value, key) {
      if (_.indexOf(PERSIST_TO_LOCAL_STORAGE, key) >= 0) {
        toSaveToLocalStorage[key] = value;
      } else {
        toSaveToSessionStorage[key] = value;
      }
    });

    // Wrap browser storage access in a try/catch block because some browsers
    // (Firefox, Chrome) except when trying to access browser storage and
    // cookies are disabled.
    try {
      localStorage.setItem(NAMESPACE, JSON.stringify(toSaveToLocalStorage));
      sessionStorage.setItem(NAMESPACE, JSON.stringify(toSaveToSessionStorage));
    } catch (e) {
      // some browsers disable access to browser storage
      // if cookies are disabled.
    }
  },

  /**
   * Get an item
   * @method get
   * @param {String} key
   * @returns {Object}
   */
  get(key) {
    return this[key];
  },

  /**
   * Remove an item or all items
   *
   * If no key specified, all items are cleared.
   * Note: items in Session.prototype cannot be cleared
   *
   * @method clear
   * @param {String} [key]
   */
  clear(key) {
    // no key specified, clear everything.
    if (typeof key === 'undefined') {
      for (key in this) {
        this.clear(key);
      }
      return;
    }

    if (this.hasOwnProperty(key)) {
      this[key] = null;
      delete this[key];
      this.persist();
    }
  },

  // BEGIN TEST API
  /**
   * Remove an item from memory but not sessionStorage. Used to test .load
   * @method testRemove
   * @param {String} key
   * @private
   */
  testRemove(key) {
    if (this.hasOwnProperty(key)) {
      this[key] = null;
      delete this[key];
    }
  },

  /**
   * Clear everything, for testing.
   * @method testClear
   * @private
   */
  testClear() {
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        this[key] = null;
        delete this[key];
      }
    }

    sessionStorage.clear();
    localStorage.clear();
  },
  // END TEST API
};

// session is a singleton
export default new Session();
