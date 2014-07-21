/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Session saves session information about the user. Data is automatically
// saved to sessionStorage and automatically loaded from sessionStorage on startup.

'use strict';

define([
  'underscore',
  'lib/constants'
], function (_, Constants) {
  var NAMESPACE = '__fxa_session';

  // channel is initialized on app startup
  // and should not be saved to sessionStorage
  var DO_NOT_PERSIST = ['channel', 'prefillPassword', 'prefillYear', 'error', 'service'];

  // channel should not be cleared from memory or else fxa-client.js
  // will blow up when sending the login message.
  // Don't clear service because the signup page needs that state
  //  even when user credentials are cleared.
  var DO_NOT_CLEAR = ['channel', 'context', 'service', 'config'];

  // these keys will be persisted to localStorage so that they live between browser sessions
  var PERSIST_TO_LOCAL_STORAGE = ['email', 'sessionToken', 'sessionTokenContext', 'oauth'];

  function Session() {
    this.load();
  }

  Session.prototype = {
    /**
     * Load info from sessionStorage
     * @method load
     */
    load: function () {
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

      this.set(values);
    },

    /**
     * Set data.
     * @method set
     * can take either a key/value pair or a dictionary of key/value pairs.
     * Note: items with keys in Session.prototype cannot be overwritten.
     */
    set: function (key, value) {
      if (typeof value === 'undefined' && typeof key === 'object') {
        return _.each(key, function (value, key) {
          this.set(key, value);
        }, this);
      }

      // don't overwrite any items on the prototype.
      if (! Session.prototype.hasOwnProperty(key)) {
        this[key] = value;
        this.persist();
      }
    },

    /**
     * Persist data to sessionStorage or localStorage
     * @method persist
     * Note: items in DO_NOT_PERSIST are not saved to sessionStorage
     */
    persist: function () {
      // items on the blacklist do not get saved to sessionStorage.
      var toSaveToSessionStorage = {};
      var toSaveToLocalStorage = {};
      _.each(this, function (value, key) {
        if (_.indexOf(DO_NOT_PERSIST, key) === -1) {
          if (_.indexOf(PERSIST_TO_LOCAL_STORAGE, key) >= 0) {
            toSaveToLocalStorage[key] = value;
          } else {
            toSaveToSessionStorage[key] = value;
          }
        }
      });

      // Wrap browser storage access in a try/catch block because some browsers
      // (Firefox, Chrome) except when trying to access browser storage and
      // cookies are disabled.
      try {
        localStorage.setItem(NAMESPACE, JSON.stringify(toSaveToLocalStorage));
        sessionStorage.setItem(NAMESPACE, JSON.stringify(toSaveToSessionStorage));

      } catch(e) {
        // some browsers disable access to browser storage
        // if cookies are disabled.
      }
    },

    /**
     * Get an item
     * @method get
     */
    get: function (key) {
      return this[key];
    },

    /**
     * Remove an item or all items
     * @method clear
     * If no key specified, all items are cleared.
     * Note: items in DO_NOT_CLEAR or Session.prototype cannot be cleared
     */
    clear: function (key) {
      // no key specified, clear everything.
      if (typeof key === 'undefined') {
        for (key in this) {
          this.clear(key);
        }
        return;
      }

      if (this.hasOwnProperty(key) && _.indexOf(DO_NOT_CLEAR, key) === -1) {
        this[key] = null;
        delete this[key];
        this.persist();
      }
    },

    // Convenience functions for data stored in session

    isDesktopContext: function () {
      return this.get('context') === Constants.FX_DESKTOP_CONTEXT;
    },

    isSync: function () {
      return this.get('service') === 'sync';
    },

    // BEGIN TEST API
    /**
     * Remove an item from memory but not sessionStorage. Used to test .load
     * @method testRemove
     * @private
     */
    testRemove: function (key) {
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
    testClear: function () {
      for (var key in this) {
        if (this.hasOwnProperty(key)) {
          this[key] = null;
          delete this[key];
        }
      }

      sessionStorage.clear();
      localStorage.clear();
    }
    // END TEST API
  };


  // session is a singleton
  return new Session();
});
