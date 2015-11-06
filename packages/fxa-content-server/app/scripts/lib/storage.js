/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module abstracts interaction with storage backends such as localStorage
// or sessionStorage.

define(function (require, exports, module) {
  'use strict';

  var NullStorage = require('lib/null-storage');
  var Url = require('lib/url');

  var NAMESPACE = '__fxa_storage';

  function fullKey (key) {
    return NAMESPACE + '.' + key;
  }

  function Storage (backend) {
    this._backend = backend || new NullStorage();
  }

  Storage.prototype.get = function (key) {
    var item;
    try {
      item = JSON.parse(this._backend.getItem(fullKey(key)));
    } catch (e) { //eslint-disable-line no-empty
    }
    return item;
  };

  Storage.prototype.set = function (key, val) {
    this._backend.setItem(fullKey(key), JSON.stringify(val));
  };

  Storage.prototype.remove = function (key) {
    this._backend.removeItem(fullKey(key));
  };

  Storage.prototype.clear = function () {
    this._backend.clear();
  };

  Storage.prototype.isNull = function () {
    return this._backend instanceof NullStorage;
  };

  Storage._isStorageEnabled = function (type, win) {
    var testData = 'storage-test';
    win = win || window;
    var storage;

    try {
      if (type === 'sessionStorage') {
        storage = win.sessionStorage;
      } else {
        // HACK: Allows the functional tests to simulate disabled local storage.
        if (Url.searchParam('disable_local_storage') === '1') {
          throw null;
        }

        storage = win.localStorage;
      }

      storage.setItem(testData, testData);
      storage.removeItem(testData);
      return true;
    } catch(e) {
      return false;
    }
  };

  Storage.isLocalStorageEnabled = function (win) {
    return this._isStorageEnabled('localStorage', win);
  };

  Storage.isSessionStorageEnabled = function (win) {
    return this._isStorageEnabled('sessionStorage', win);
  };

  Storage.factory = function (type, win) {
    var storage;
    win = win || window;

    if (type === 'localStorage' && this.isLocalStorageEnabled(win)) {
      storage = new Storage(win.localStorage);
    } else if (type === 'sessionStorage' && this.isSessionStorageEnabled(win)) {
      storage = new Storage(win.sessionStorage);
    } else {
      storage = new Storage(new NullStorage());
    }

    return storage;
  };

  module.exports = Storage;
});
