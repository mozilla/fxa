/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module abstracts interaction with storage backends such as localStorage
// or sessionStorage.

import NullStorage from './null-storage';
import Url from './url';

var NAMESPACE = '__fxa_storage';

function fullKey(key) {
  return NAMESPACE + '.' + key;
}

function normalizeError(error, type) {
  error.context = 'storage';
  error.namespace = type;
  // Firefox localStorage errors contain a `name` field. Report that
  // name if available, otherwise return the whole message.
  error.errno = error.name || error.message;

  return error;
}

function Storage(backend) {
  this._backend = backend || new NullStorage();
}

Storage.prototype.get = function(key) {
  var item;
  try {
    item = JSON.parse(this._backend.getItem(fullKey(key)));
  } catch (e) {
    //eslint-disable-line no-empty
  }
  return item;
};

Storage.prototype.set = function(key, val) {
  this._backend.setItem(fullKey(key), JSON.stringify(val));
};

Storage.prototype.remove = function(key) {
  this._backend.removeItem(fullKey(key));
};

Storage.prototype.clear = function() {
  this._backend.clear();
};

Storage.prototype.isNull = function() {
  return this._backend instanceof NullStorage;
};

/**
 * Test whether storage can be written to and removed from.
 *
 * @param {String} type - (localStorage|sessionStorage)
 * @param {Object} [win] - window object
 * @throws browser generated errors, `disabled for tests` if disabled for
 *   tests.
 */
Storage.testStorage = function(type, win) {
  try {
    var testData = 'storage-test';
    win = win || window;
    var storage;

    if (type === 'sessionStorage') {
      storage = win.sessionStorage;
    } else {
      // HACK: Allows the functional tests to simulate disabled local storage.
      if (
        Url.searchParam('disable_local_storage', win.location.search) === '1'
      ) {
        throw new Error('disabled for tests');
      }

      storage = win.localStorage;
    }

    storage.setItem(testData, testData);
    storage.removeItem(testData);
  } catch (e) {
    throw normalizeError(e, type);
  }
};

/**
 * Check if there are any problems accessing localStorage
 *
 * @param {Object} [win] - window object
 */
Storage.testLocalStorage = function(win) {
  Storage.testStorage('localStorage', win);
};

/**
 * Check if there are any problems accessing sessionStorage
 *
 * @param {Object} win - window object
 * @throws browser generated errors, `disabled for tests` if disabled for
 *   tests.
 */
Storage.testSessionStorage = function(win) {
  Storage.testStorage('sessionStorage', win);
};

Storage._isStorageEnabled = function(type, win) {
  try {
    Storage.testStorage(type, win);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if localStorage is enabled
 *
 * @param {Object} [win]
 * @returns {Boolean}
 */
Storage.isLocalStorageEnabled = function(win) {
  return Storage._isStorageEnabled('localStorage', win);
};

/**
 * Check if sessionStorage is enabled
 *
 * @param {Object} [win]
 * @returns {Boolean}
 */
Storage.isSessionStorageEnabled = function(win) {
  return Storage._isStorageEnabled('sessionStorage', win);
};

Storage.factory = function(type, win) {
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

export default Storage;
