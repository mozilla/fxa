/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('../promise');

/*
 * MemoryStore structure:
 * MemoryStore = {
 * }
 */
function MemoryStore() {
  if (!(this instanceof MemoryStore)) {
    return new MemoryStore();
  }
  this.profiles = {};
}

MemoryStore.connect = function memoryConnect() {
  return Promise.resolve(new MemoryStore());
};

MemoryStore.prototype = {

};

module.exports = MemoryStore;
