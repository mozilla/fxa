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
 *       termsUri: <string>,
 *       privacyUri: <string>,
 *       trusted: <boolean>,
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
 *   developers: {
 *     <developerId>: {
 *       developerId: <developer_id>,
 *       email: <string>,
 *       createdAt: <timestamp>
 *     }
 *   },
 *   clientDevelopers: {
 *     <id>: {
 *       developerId: <developer_id>,
 *       clientId: <client_id>,
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
  this.developers = {};
  this.clientDevelopers = {};
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
    client.imageUri = client.imageUri || '';
    client.redirectUri = client.redirectUri || '';
    client.termsUri = client.termsUri || '';
    client.privacyUri = client.privacyUri || '';
    client.canGrant = !!client.canGrant;
    client.trusted = !!client.trusted;
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
  getClients: function getClients(email) {
    var self = this;

    return this.getDeveloper(email)
      .then(function (developer) {
        if (! developer) {
          return [];
        }

        var clients = [];

        Object.keys(self.clientDevelopers).forEach(function(key) {
          var entry = self.clientDevelopers[key];
          if (entry.developerId === developer.developerId) {
            clients.push(unbuf(entry.clientId));
          }
        });

        return clients.map(function(id) {
          var client = self.clients[id];

          return {
            id: client.id,
            name: client.name,
            imageUri: client.imageUri,
            redirectUri: client.redirectUri,
            termsUri: client.termsUri,
            privacyUri: client.privacyUri,
            canGrant: client.canGrant,
            trusted: client.trusted
          };
        }, this);
      });
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
  },
  activateDeveloper: function activateDeveloper(email) {
    var self = this;

    if (! email) {
      return P.reject(new Error('Email is required'));
    }

    return this.getDeveloper(email)
      .then(function(result) {
        if (result) {
          return P.reject(new Error('ER_DUP_ENTRY'));
        }

        var newId = unique.developerId();
        var developer = {
          developerId: newId,
          email: email,
          createdAt: new Date()
        };

        self.developers[unbuf(newId)] = developer;
        return developer;

      });
  },
  getDeveloper: function getDeveloper(email) {
    var self = this;
    var developer = null;

    if (! email) {
      return P.reject(new Error('Email is required'));
    }

    Object.keys(self.developers).forEach(function(developerId) {
      var devEntry = self.developers[developerId];

      if (devEntry.email === email) {
        developer = devEntry;
      }
    });

    return P.resolve(developer);
  },
  removeDeveloper: function removeDeveloper(email) {
    var self = this;

    if (! email) {
      return P.reject(new Error('Email is required'));
    }

    Object.keys(self.developers).forEach(function(developerId) {
      var devEntry = self.developers[developerId];

      if (devEntry.email === email) {
        delete self.developers[developerId];
      }
    });

    return P.resolve();
  },
  developerOwnsClient: function devOwnsClient(developerEmail, clientId) {
    var self = this;
    var developerId;

    logger.debug('developerOwnsClient');
    return self.getDeveloper(developerEmail)
      .then(function (developer) {
        if (! developer) {
          return P.reject();
        }
        developerId = developer.developerId;

        return self.getClientDevelopers(clientId);
      })
      .then(function (developers) {
        var result;

        function hasDeveloper(developer) {
          result = developer;
          return unbuf(developer.developerId) === unbuf(developerId);
        }

        if (developers.some(hasDeveloper)) {
          return P.resolve(true);
        } else {
          return P.reject(false);
        }

      });
  },
  registerClientDeveloper: function regClientDeveloper(developerId, clientId) {
    var entry = {
      developerId: buf(developerId),
      clientId: buf(clientId),
      createdAt: new Date()
    };
    var uniqueHexId = unbuf(unique.id());

    logger.debug('registerClientDeveloper', entry);
    this.clientDevelopers[uniqueHexId] = entry;
    return P.resolve(entry);
  },
  getClientDevelopers: function getClientDevelopers(clientId) {
    var self = this;
    var developers = [];

    if (! clientId) {
      return P.reject(new Error('Client id is required'));
    }

    clientId = unbuf(clientId);

    Object.keys(self.clientDevelopers).forEach(function(key) {
      var entry = self.clientDevelopers[key];

      if (unbuf(entry.clientId) === clientId) {
        developers.push(self.developers[unbuf(entry.developerId)]);
      }
    });

    return P.resolve(developers);
  }

};

module.exports = MemoryStore;
