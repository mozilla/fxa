/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module abstracts interaction with storage backends such as localStorage
// or sessionStorage.

import NullStorage from './null-storage';
import Url from './url';

const NAMESPACE = '__fxa_storage';

function fullKey(key: string) {
  return NAMESPACE + '.' + key;
}

function normalizeError(
  error: {
    context: string;
    namespace: any;
    errno: any;
    name: any;
    message: any;
  },
  type: string
) {
  error.context = 'storage';
  error.namespace = type;
  // Firefox localStorage errors contain a `name` field. Report that
  // name if available, otherwise return the whole message.
  error.errno = error.name || error.message;

  return error;
}

interface DOMStorage {
  getItem(arg0: string): string | null;
  setItem(arg0: string, arg1: any): void;
  removeItem(arg0: string): void;
  clear(): void;
}

class Storage {
  private _backend: DOMStorage;
  type: string;

  constructor(backend: DOMStorage, type: string) {
    this._backend = backend || new NullStorage();
    this.type = type;
  }

  get(key: string): any {
    let item;
    try {
      item = JSON.parse(this._backend.getItem(fullKey(key)) || '');
    } catch (e) {
      // eslint-disable-line no-empty
    }
    return item;
  }

  set(key: string, val: any): void {
    this._backend.setItem(fullKey(key), JSON.stringify(val));
  }

  remove(key: string) {
    this._backend.removeItem(fullKey(key));
  }

  clear() {
    this._backend.clear();
  }

  isNull() {
    return this._backend instanceof NullStorage;
  }

  /**
   * Test whether storage can be written to and removed from.
   *
   * @param {String} type - (localStorage|sessionStorage)
   * @param {Object} [win] - window object
   * @throws browser generated errors, `disabled for tests` if disabled for
   *   tests.
   */
  static testStorage(type: string, win: Window = window) {
    try {
      const testData = 'storage-test';
      let storage;

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
  }

  /**
   * Check if there are any problems accessing localStorage
   *
   * @param {Object} [win] - window object
   * @throws {Error} throws an error if storage is disabled
   */
  static testLocalStorage(win: Window) {
    Storage.testStorage('localStorage', win);
  }

  /**
   * Check if there are any problems accessing sessionStorage
   *
   * @param {Object} win - window object
   * @throws browser generated errors, `disabled for tests` if disabled for
   *   tests.
   */
  static testSessionStorage(win: Window) {
    Storage.testStorage('sessionStorage', win);
  }

  static _isStorageEnabled(type: string, win: Window): boolean {
    try {
      Storage.testStorage(type, win);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if localStorage is enabled
   *
   * @param {Window} [win]
   * @returns {Boolean}
   */
  static isLocalStorageEnabled(win: Window): boolean {
    return Storage._isStorageEnabled('localStorage', win);
  }

  /**
   * Check if sessionStorage is enabled
   *
   * @param {Window} [win]
   * @returns {Boolean}
   */
  static isSessionStorageEnabled(win: Window): boolean {
    return Storage._isStorageEnabled('sessionStorage', win);
  }

  static factory(type: string, win: Window = window): Storage {
    let storage;
    if (type === 'localStorage' && this.isLocalStorageEnabled(win)) {
      storage = new Storage(win.localStorage, 'local');
    } else if (type === 'sessionStorage' && this.isSessionStorageEnabled(win)) {
      storage = new Storage(win.sessionStorage, 'session');
    } else {
      storage = new Storage(new NullStorage(), 'null');
    }
    return storage;
  }
}

export default Storage;
