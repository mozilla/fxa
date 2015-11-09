/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Verification info that is stored locally in case the user verifies
 * in the same browser. This allows information like `context`
 * to be re-used if the user verifies in the same browser, but not
 * in a different browser.
 *
 * Information is persisted into localStorage. Either an `email` or `uid`
 * is required for the verification info to be fetched.
 *
 * `uid` is used in signup and account unlock verifications
 * `email` is used in password reset verifications.
 */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var Storage = require('lib/storage');

  var STORAGE_KEY = 'verificationInfo';

  var proto = Backbone.Model.prototype;

  var SameBrowserVerificationModel = Backbone.Model.extend({
    initialize: function (attributes, options) {
      proto.initialize.call(this, attributes, options);

      this._email = options.email;
      this._namespace = options.namespace;
      this._uid = options.uid;
      this._window = options.window || window;

      this._storage = options.storage || new Storage(this._window.localStorage);
    },

    _STORAGE_KEY: STORAGE_KEY,

    /**
     * Get the user's storage ID. `uid` is used for signup/account unlock,
     * `email` for password reset.
     *
     * @returns {string}
     * @private
     */
    _getUsersStorageId: function () {
      return this._uid || this._email;
    },

    /**
     * Persist verification info to localStorage. Info will be loaded on
     * verification in verification occurs in the same browser.
     */
    persist: function () {
      var id = this._getUsersStorageId();
      if (id) {
        var verificationInfo = this._storage.get(STORAGE_KEY) || {};
        verificationInfo[id] = verificationInfo[id] || {};
        verificationInfo[id][this._namespace] = this.toJSON();
        this._storage.set(STORAGE_KEY, verificationInfo);
      }
    },

    /**
     * Load verification info for the current user from localStorage
     */
    load: function () {
      var id = this._getUsersStorageId();
      if (id) {
        var usersStoredInfo = (this._storage.get(STORAGE_KEY) || {})[id];
        if (usersStoredInfo) {
          this.set(usersStoredInfo[this._namespace] || {});
        }
      }
    },

    /**
     * Clear verification info from localStorage
     */
    clear: function () {
      var id = this._getUsersStorageId();
      if (id) {
        var verificationInfo = this._storage.get(STORAGE_KEY) || {};
        if (verificationInfo[id]) {
          delete verificationInfo[id][this._namespace];
          if (! Object.keys(verificationInfo[id]).length) {
            delete verificationInfo[id];
          }
          this._storage.set(STORAGE_KEY, verificationInfo);
        }
      }
    }
  });

  module.exports = SameBrowserVerificationModel;
});
