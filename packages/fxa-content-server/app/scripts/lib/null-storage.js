/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a memory store that's api compatible with localStorage/sessionStorage.
// It's used for testing lib/storage.

function NullStorage() {
  this._storage = {};
}

NullStorage.prototype.getItem = function (key) {
  return key ? this._storage[key] : null;
};

NullStorage.prototype.get = function (key) {
  return this.getItem(key);
};

NullStorage.prototype.setItem = function (key, val) {
  if (!key) {
    return;
  }
  this._storage[key] = val;
};

NullStorage.prototype.set = function (key, val) {
  return this.setItem(key, val);
};

NullStorage.prototype.removeItem = function (key) {
  if (!key) {
    return;
  }
  delete this._storage[key];
};

NullStorage.prototype.clear = function () {
  this._storage = {};
};

export default NullStorage;
