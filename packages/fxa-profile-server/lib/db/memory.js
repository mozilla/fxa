/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../promise');

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
  return P.resolve(new MemoryStore());
};

MemoryStore.prototype = {
  profileExists: function profileExists(id) {
    return this.getProfile(id).then(function(user) {
      return !!user;
    });
  },
  createProfile: function createProfile(profile) {
    this.profiles[profile.uid] = profile;
    return P.resolve(true);
  },
  getProfile: function getProfile(id) {
    return P.resolve(this.profiles[id]);
  },
  getOrCreateProfile: function getOrCreateProfile(id) {
    var db = this;
    return db.profileExists(id).then(function(exists) {
      if (!exists) {
        return db.createProfile({ uid: id });
      }
    }).then(function() {
      return db.getProfile(id);
    });
  },
  setAvatar: function setAvatar(userId, url) {
    if (!this.profiles[userId]) {
      return P.reject(new Error('User (' + userId + ') does not exist'));
    }
    this.profiles[userId].avatar = url;
    return P.resolve(true);
  }
};

module.exports = MemoryStore;
