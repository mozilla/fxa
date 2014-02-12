/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('../promise');

/*
 * MemoryStore structure:
 * MemoryStore = {
 *   profiles: {
 *     <uid>: {
 *       uid: <id>
 *       avatar: <url>
 *     }
 *   }
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
  profileExists: function profileExists(id) {
    return this.getProfile(id).then(function(user) {
      return !!user;
    });
  },
  createProfile: function createProfile(profile) {
    this.profiles[profile.uid] = profile;
    return Promise.resolve(true);
  },
  getProfile: function getProfile(id) {
    return Promise.resolve(this.profiles[id]);
  },
  setAvatar: function setAvatar(userId, url) {
    if (!this.profiles[userId]) {
      return Promise.reject(new Error('User (' + userId + ') does not exist'));
    }
    this.profiles[userId].avatar = url;
    return Promise.resolve(true);
  }
};

module.exports = MemoryStore;
