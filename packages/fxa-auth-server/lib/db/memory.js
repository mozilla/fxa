/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const encrypt = require('../encrypt');
const logger = require('../logging').getLogger('fxa.db.memory');
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

MemoryStore.prototype = {
  ping: function ping() {
    return P.resolve();
  },
  registerClient: function registerClient(client) {
    if (client.id) {
      logger.debug('registerClient: client already has ID?', client.id);
      client.id = Buffer(client.id, 'hex');
    } else {
      client.id = unique.id();
    }
    logger.debug('registerClient', client.name, client.id.toString('hex'));
    client.createdAt = new Date();
    this.clients[client.id] = client;
    client.secret = encrypt.hash(client.secret);
    return client;
  },
  getClient: function getClient(id) {
    return P.resolve(this.clients[id]);
  },
  generateCode: function generateCode(clientId, userId, email, scope) {
    var code = {};
    code.clientId = clientId;
    code.userId = userId;
    code.email = email;
    code.scope = scope;
    code.createdAt = new Date();
    var _code = unique.code();
    code.code = encrypt.hash(_code);
    this.codes[code.code.toString('hex')] = code;
    return P.resolve(_code);
  },
  getCode: function getCode(code) {
    return P.resolve(this.codes[encrypt.hash(code).toString('hex')]);
  },
  removeCode: function removeCode(id) {
    delete this.codes[id.toString('hex')];
    return P.resolve();
  },
  generateToken: function generateToken(code) {
    var store = this;
    return this.removeCode(code.code).then(function() {
      var token = {};
      token.clientId = code.clientId;
      token.userId = code.userId;
      token.email = code.email;
      token.scope = code.scope;
      token.createdAt = new Date();
      token.type = 'bearer';
      var _token = unique.token();
      var ret = clone(token);
      token.token = encrypt.hash(_token);
      store.tokens[token.token.toString('hex')] = token;
      ret.token = _token;
      return ret;
    });
  },
  getToken: function getToken(token) {
    return P.resolve(this.tokens[encrypt.hash(token).toString('hex')]);
  }
};

module.exports = MemoryStore;
