/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Session saves session information about the user. Data is automatically
// saved to localStorage and automatically loaded from localStorage on startup.

'use strict';

define([
  'underscore'
], function (_) {
  var NAMESPACE = '__fxa_session';

  // channel is initialized on app startup
  // and should not be saved to localStorage
  var DO_NOT_PERSIST = ['channel'];
  var DO_NOT_CLEAR = ['channel'];

  function Session() {
    this.load();
  }

  Session.prototype = {
    load: function () {
      var values = {};
      try {
        values = JSON.parse(localStorage.getItem(NAMESPACE));
        this.set(values);
      } catch(e) {
        // ignore the parse error.
      }
    },

    set: function (key, value) {
      if (typeof value === 'undefined' && typeof key === 'object') {
        return _.each(key, function (value, key) {
          this.set(key, value);
        }, this);
      }

      // don't overwrite any items on the prototype.
      if (! Session.prototype.hasOwnProperty(key)) {
        this[key] = value;

        // items on the blacklist do not get saved to localStorage but we
        // still want a reference to them in the session information.
        if (DO_NOT_PERSIST.indexOf(key) === -1) {
          localStorage.setItem(NAMESPACE, JSON.stringify(this));
        }
      }
    },

    get: function (key) {
      return this[key];
    },

    clear: function (key) {
      // no key specified, clear everything.
      if (typeof key === 'undefined') {
        for (key in this) {
          this.clear(key);
        }
        return;
      }

      if (this.hasOwnProperty(key) && DO_NOT_CLEAR.indexOf(key) === -1) {
        this[key] = null;
        delete this[key];
        localStorage.setItem(NAMESPACE, JSON.stringify(this));
      }
    },

    // BEGIN TEST API
    testRemove: function (key) {
      if (this.hasOwnProperty(key)) {
        this[key] = null;
        delete this[key];
      }
    }
    // END TEST API
  };


  // session is a singleton
  return new Session();
});
