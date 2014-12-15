/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const buf = require('buf');
const hex = buf.to.hex;

const config = require('../config');
const P = require('../promise');

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/*
 * MemoryStore structure:
 * MemoryStore = {
 *   avatars: {
 *     <id>: {
 *       id: <id>,
 *       url: <string>,
 *       userId: <uid>,
 *       providerId: <providers.id>
 *     }
 *   },
 *   providers: {
 *     <id>: {
 *       id: <id>,
 *       name: <string>
 *     }
 *   },
 *   selected: {
 *     <uid>: {
 *       userId: <uid>,
 *       avatarId: <avatar.id>
 *     }
 *   }
 * }
 */
function MemoryStore() {
  if (!(this instanceof MemoryStore)) {
    return new MemoryStore();
  }
  this.avatars = {};
  this.providers = {};
  this.selected = {};
}

MemoryStore.connect = function memoryConnect() {
  return P.resolve(new MemoryStore());
};

MemoryStore.prototype = {

  ping: function ping() {
    return P.resolve();
  },

  addAvatar: function addAvatar(id, uid, url, provider, selected) {
    var avatar = {
      id: id,
      url: url,
      providerId: provider,
      userId: uid
    };
    this.avatars[hex(id)] = avatar;
    if (selected) {
      this.selected[hex(uid)] = {
        userId: uid,
        avatarId: id
      };
    }
    return P.fulfilled();
  },

  getAvatar: function getAvatar(id) {
    return P.resolve(this.avatars[hex(id)]);
  },

  getSelectedAvatar: function getSelectedAvatar(uid) {
    var selected = this.selected[hex(uid)];
    if (selected) {
      var avatar = this.avatars[hex(selected.avatarId)];
      return P.resolve(avatar);
    }
    return P.resolve();
  },

  getAvatars: function getAvatars(uid) {
    uid = hex(uid);
    var ids = Object.keys(this.avatars);
    var selected = this.selected[uid];
    var avatars = [];
    for (var i = 0; i < ids.length; i++) {
      if (hex(this.avatars[ids[i]].userId) === uid) {
        var av = clone(this.avatars[ids[i]]);
        if (selected && hex(selected.avatarId) === ids[i]) {
          av.selected = true;
        }
        avatars.push(av);
      }
    }
    return P.resolve(avatars);
  },

  deleteAvatar: function deleteAvatar(id) {
    delete this.avatars[hex(id)];
    return P.resolve();
  },

  addProvider: function addProvider(name) {
    this.providers[name] = name;
    return P.resolve(name);
  },

  getProviderByName: function getProviderByName(name) {
    return P.resolve({ id: name, name: name });
  },

  getProviderById: function getProviderById(id) {
    return P.resolve({ id: id, name: id });
  }
};

if (config.get('env') === 'test') {
  MemoryStore.prototype._clear = function clear() {
    this.avatars = {};
    this.providers = {};
    this.selected = {};
    return P.resolve();
  };
}

module.exports = MemoryStore;
