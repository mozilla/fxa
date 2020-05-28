/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a memory store that's api compatible with localStorage
// and sessionStorage, used for testing lib/storage.

class NullStorage {
  _storage: { [key: string]: any } = {};

  getItem(key: string): any {
    return key ? this._storage[key] : null;
  }

  setItem(key: string, value: any) {
    if (!key) {
      return;
    }

    this._storage[key] = value;
  }

  removeItem(key: string) {
    if (!key) {
      return;
    }

    delete this._storage[key];
  }

  clear() {
    this._storage = {};
  }
}

export default NullStorage;
