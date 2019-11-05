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
 * `uid` is used in signup verifications
 * `email` is used in password reset verifications.
 */

import Backbone from 'backbone';
import Storage from '../../lib/storage';

var STORAGE_KEY = 'verificationInfo';

var proto = Backbone.Model.prototype;

var SameBrowserVerificationModel = Backbone.Model.extend({
  initialize(attributes, options) {
    proto.initialize.call(this, attributes, options);

    this._email = options.email;
    this._namespace = options.namespace;
    this._uid = options.uid;
    this._window = options.window || window;

    this._storage = options.storage || new Storage(this._window.localStorage);
  },

  _STORAGE_KEY: STORAGE_KEY,

  /**
   * Get the user's storage ID. `uid` is used for signup,
   * `email` for password reset.
   *
   * @returns {String}
   * @private
   */
  _getUsersStorageId() {
    return this._uid || this._email;
  },

  /**
   * Persist verification info to localStorage. Info will be loaded on
   * verification in verification occurs in the same browser.
   */
  persist() {
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
  load() {
    var id = this._getUsersStorageId();
    if (id) {
      const allStoredInfo = this._storage.get(STORAGE_KEY) || {};
      // During password reset, SameBrowserVerificationModel will persist
      // info keyed by email since the uid is not known when the flow is
      // initiated. All other flows key by uid.
      // As of train-117 links in the password reset emails contain
      // both a uid and an email.
      // First, try fetching the info using uid since that'll cover all
      // flows except password reset. If that fails, try email to
      // handle password reset.
      const usersStoredInfo =
        allStoredInfo[this._uid] || allStoredInfo[this._email];
      if (usersStoredInfo) {
        this.set(usersStoredInfo[this._namespace] || {});
      }
    }
  },

  /**
   * Clear verification info from localStorage
   */
  clear() {
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
  },
});

export default SameBrowserVerificationModel;
