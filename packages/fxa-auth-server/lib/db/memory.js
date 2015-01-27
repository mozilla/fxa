/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const buf = require('buf').hex;
const unbuf = require('buf').unbuf.hex;

const encrypt = require('../encrypt');
const logger = require('../logging')('db.memory');
const P = require('../promise');
const unique = require('../unique');

/*
 * MemoryStore structure:
 * MemoryStore = {
 *   clients: {
 *     <id>: {
 *       id: <id>,
 *       secret: <string>,
 *       name: <string>,
 *       imageUri: <string>,
 *       redirectUri: <string>,
 *       whitelisted: <boolean>,
 *       createdAt: <timestamp>
 *     }
 *   },
 *   codes: {
 *     <code>: {
 *       clientId: <client_id>,
 *       userId: <user_id>,
 *       code: <string>
 *       scope: <string>,
 *       authAt: <timestamp>,
 *       createdAt: <timestamp>
 *     }
 *   },
 *   tokens: {
 *     <token>: {
 *       token: <string>,
 *       clientId: <client_id>,
 *       userId: <user_id>,
 *       type: <string>,
 *       scope: <string>,
 *       createdAt: <timestamp>
 *     }
 *   }
 * }
 */
function MemoryStore() {
  if (!(this instanceof MemoryStore)) {
    return new MemoryStore();
  }
  this.clients = {};
  this.codes = {};
  this.tokens = {};
}

MemoryStore.connect = function memoryConnect() {
  return P.resolve(new MemoryStore());
};

function clone(obj) {
  var clone = {};
  for (var k in obj) {
    clone[k] = obj[k];
  }
  return clone;
}

function deleteByUserId(object, userId) {
  var ids = Object.keys(object);
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    if (object[id].userId === userId) {
      delete object[id];
    }
  }
}

MemoryStore.prototype = {
  ping: function ping() {
    return P.resolve();
  },
  registerClient: function registerClient(client) {
    if (client.id) {
      client.id = buf(client.id);
    } else {
      client.id = unique.id();
    }
    var hex = unbuf(client.id);
    logger.debug('registerClient', { name: client.name, id: hex });
    client.createdAt = new Date();
    client.canGrant = !!client.canGrant;
    client.whitelisted = !!client.whitelisted;
    this.clients[hex] = client;
    client.secret = client.hashedSecret;
    return P.resolve(client);
  },
  updateClient: function updateClient(client) {
    if (!client.id) {
      return P.reject(new Error('Update client needs an id'));
    }
    var hex = unbuf(client.id);
    if (!this.clients[hex]) {
      return P.reject(new Error('Client does not exist'));
    }
    var old = this.clients[hex];
    for (var key in client) {
      if (key === 'id') {
        // nothing
      } else if (key === 'hashedSecret') {
        old.secret = buf(client[key]);
      } else if (client[key] !== undefined) {
        old[key] = client[key];
      }
    }
    return P.resolve(old);
  },
  getClient: function getClient(id) {
    return P.resolve(this.clients[unbuf(id)]);
  },
  getClients: function getClients() {
    return P.resolve(Object.keys(this.clients).map(function(id) {
      var client = this.clients[id];
      return {
        id: client.id,
        name: client.name,
        imageUri: client.imageUri,
        redirectUri: client.redirectUri,
        canGrant: client.canGrant,
        whitelisted: client.whitelisted
      };
    }, this));
  },
  removeClient: function removeClient(id) {
    delete this.clients[unbuf(id)];
    return P.resolve();
  },
  generateCode: function generateCode(clientId, userId, email, scope, authAt) {
                                      
    var code = {};
    code.clientId = clientId;
    code.userId = userId;
    code.email = email;
    code.scope = scope;
    code.authAt = authAt;
    code.createdAt = new Date();
    var _code = unique.code();
    code.code = encrypt.hash(_code);
    this.codes[unbuf(code.code)] = code;
    return P.resolve(_code);
  },
  getCode: function getCode(code) {
    return P.resolve(this.codes[unbuf(encrypt.hash(code))]);
  },
  removeCode: function removeCode(id) {
    delete this.codes[unbuf(id)];
    return P.resolve();
  },
  generateToken: function generateToken(vals) {
    var token = {};
    token.clientId = vals.clientId;
    token.userId = vals.userId;
    token.email = vals.email;
    token.scope = vals.scope;
    token.createdAt = new Date();
    token.type = 'bearer';
    var _token = unique.token();
    var ret = clone(token);
    token.token = encrypt.hash(_token);
    this.tokens[unbuf(token.token)] = token;
    ret.token = _token;
    return P.resolve(ret);
  },
  getToken: function getToken(token) {
    return P.resolve(this.tokens[unbuf(token)]);
  },
  removeToken: function removeToken(id) {
    delete this.tokens[unbuf(id)];
    return P.resolve();
  },
  getEncodingInfo: function getEncodingInfo() {
    console.warn('getEncodingInfo has no meaning with memory implementation');
    return P.resolve({});
  },
  removeUser: function removeUser(userId) {
    deleteByUserId(this.tokens, userId);
    deleteByUserId(this.codes, userId);
    return P.resolve();
  }
};

module.exports = MemoryStore;
