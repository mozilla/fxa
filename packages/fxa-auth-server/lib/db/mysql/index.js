/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

const buf = require('buf').hex;
const hex = require('buf').to.hex;
const mysql = require('mysql');
const MysqlPatcher = require('mysql-patcher');

const encrypt = require('../../encrypt');
const logger = require('../../logging')('db.mysql');
const P = require('../../promise');
const unique = require('../../unique');
const patch = require('./patch');


function MysqlStore(options) {
  if (options.charset && options.charset !== 'UTF8_UNICODE_CI') {
    logger.warn('createDatabase', { charset: options.charset });
  } else {
    options.charset = 'UTF8_UNICODE_CI';
  }
  options.typeCast = function(field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return field.string() === '1';
    }
    return next();
  };
  this._pool = mysql.createPool(options);
}

// Apply patches up to the current patch level.
// This will also create the DB if it is missing.

function updateDbSchema(patcher) {
  logger.verbose('updateDbSchema', patcher.options);

  var d = P.defer();
  patcher.patch(function(err) {
    if (err) {
      logger.error('updateDbSchema', err);
      return d.reject(err);
    }
    d.resolve();
  });

  return d.promise;
}

// Sanity-check that we're working with a compatible patch level.

function checkDbPatchLevel(patcher) {
  logger.verbose('checkDbPatchLevel', patcher.options);

  var d = P.defer();

  patcher.readDbPatchLevel(function(err) {
    if (err) {
      logger.error('checkDbPatchLevel', err);
      return d.reject(err);
    }
    // We are only guaranteed to run correctly if we're at the current
    // patch level for this version of the code (the normal state of
    // affairs) or the one immediately above it (during a deployment).
    if (patcher.currentPatchLevel !== patch.level) {
      if (patcher.currentPatchLevel !== patch.level + 1) {
        err = 'unexpected db patch level: ' + patcher.currentPatchLevel;
        logger.error('checkDbPatchLevel', err);
        return d.reject(new Error(err));
      }
    }
    d.resolve();
  });

  return d.promise;
}

MysqlStore.connect = function mysqlConnect(options) {

  options.createDatabase = options.createSchema;
  options.dir = path.join(__dirname, 'patches');
  options.metaTable = 'dbMetadata';
  options.patchKey = 'schema-patch-level';
  options.patchLevel = patch.level;
  options.mysql = mysql;
  var patcher = new MysqlPatcher(options);

  return P.promisify(patcher.connect, patcher)().then(function() {
    if (options.createSchema) {
      return updateDbSchema(patcher);
    }
  }).then(function() {
    return checkDbPatchLevel(patcher);
  }).then(function() {
    return P.promisify(patcher.end, patcher)();
  }).then(function() {
    return new MysqlStore(options);
  });
};

const QUERY_CLIENT_REGISTER =
  'INSERT INTO clients ' +
  '(id, name, imageUri, secret, redirectUri, whitelisted, canGrant) ' +
  'VALUES (?, ?, ?, ?, ?, ?, ?);';
const QUERY_CLIENT_GET = 'SELECT * FROM clients WHERE id=?';
const QUERY_CLIENT_LIST = 'SELECT id, name, redirectUri, imageUri, canGrant, ' +
  'whitelisted FROM clients';
const QUERY_CLIENT_UPDATE = 'UPDATE clients SET ' +
  'name=COALESCE(?, name), imageUri=COALESCE(?, imageUri), ' +
  'secret=COALESCE(?, secret), redirectUri=COALESCE(?, redirectUri), ' +
  'whitelisted=COALESCE(?, whitelisted), canGrant=COALESCE(?, canGrant) ' +
  'WHERE id=?';
const QUERY_CLIENT_DELETE = 'DELETE FROM clients WHERE id=?';
const QUERY_CODE_INSERT =
  'INSERT INTO codes (clientId, userId, email, scope, authAt, code) ' +
  'VALUES (?, ?, ?, ?, ?, ?)';
const QUERY_TOKEN_INSERT =
  'INSERT INTO tokens (clientId, userId, email, scope, type, token) VALUES ' +
  '(?, ?, ?, ?, ?, ?)';
const QUERY_TOKEN_FIND = 'SELECT * FROM tokens WHERE token=?';
const QUERY_CODE_FIND = 'SELECT * FROM codes WHERE code=?';
const QUERY_CODE_DELETE = 'DELETE FROM codes WHERE code=?';
const QUERY_TOKEN_DELETE = 'DELETE FROM tokens WHERE token=?';
const QUERY_TOKEN_DELETE_USER = 'DELETE FROM tokens WHERE userId=?';
const QUERY_CODE_DELETE_USER = 'DELETE FROM codes WHERE userId=?';

function firstRow(rows) {
  return rows[0];
}

function releaseConn(connection) {
  connection.release();
}

MysqlStore.prototype = {

  ping: function ping() {
    logger.debug('ping');
    // see bluebird.using():
    // https://github.com/petkaantonov/bluebird/blob/master/API.md#resource-management
    return P.using(this._getConnection(), function(conn) {
      return new P(function(resolve, reject) {
        conn.ping(function(err) {
          if (err) {
            logger.error('ping:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  },

  // createdAt is DEFAULT NOW() in the schema.sql
  registerClient: function registerClient(client) {
    var id;
    if (client.id) {
      id = buf(client.id);
    } else {
      id = unique.id();
    }
    logger.debug('registerClient', { name: client.name, id: hex(id) });
    return this._write(QUERY_CLIENT_REGISTER, [
      id,
      client.name,
      client.imageUri,
      buf(client.hashedSecret),
      client.redirectUri,
      !!client.whitelisted,
      !!client.canGrant
    ]).then(function() {
      logger.debug('registerClient.success', { id: hex(id) });
      client.id = id;
      return client;
    });
  },

  updateClient: function updateClient(client) {
    if (!client.id) {
      return P.reject(new Error('Update client needs an id'));
    }
    var secret = client.hashedSecret || client.secret || null;
    if (secret) {
      secret = buf(secret);
    }
    return this._write(QUERY_CLIENT_UPDATE, [
      // VALUES
      client.name,
      client.imageUri,
      secret,
      client.redirectUri,
      client.whitelisted,
      client.canGrant,

      // WHERE
      buf(client.id)
    ]);
  },

  getClient: function getClient(id) {
    return this._readOne(QUERY_CLIENT_GET, [buf(id)]);
  },
  getClients: function getClients() {
    return this._read(QUERY_CLIENT_LIST);
  },
  removeClient: function removeClient(id) {
    return this._write(QUERY_CLIENT_DELETE, [buf(id)]);
  },
  generateCode: function generateCode(clientId, userId, email, scope, authAt) {
    var code = unique.code();
    var hash = encrypt.hash(code);
    return this._write(QUERY_CODE_INSERT, [
      clientId,
      userId,
      email,
      scope.join(' '),
      authAt,
      hash
    ]).then(function() {
      return code;
    });
  },
  getCode: function getCode(code) {
    logger.debug('getCode');
    var hash = encrypt.hash(code);
    return this._readOne(QUERY_CODE_FIND, [hash]).then(function(code) {
      if (code) {
        code.scope = code.scope.split(' ');
      }
      return code;
    });
  },
  removeCode: function removeCode(id) {
    return this._write(QUERY_CODE_DELETE, [id]);
  },
  generateToken: function generateToken(vals) {
    var t = {
      clientId: vals.clientId,
      userId: vals.userId,
      email: vals.email,
      scope: vals.scope,
      type: 'bearer'
    };
    var _token = unique.token();
    var me = this;
    var hash = encrypt.hash(_token);
    return me._write(QUERY_TOKEN_INSERT, [
      t.clientId,
      t.userId,
      t.email,
      t.scope.join(' '),
      t.type,
      hash
    ]).then(function() {
      t.token = _token;
      return t;
    });
  },

  getToken: function getToken(token) {
    return this._readOne(QUERY_TOKEN_FIND, [buf(token)]).then(function(t) {
      if (t) {
        t.scope = t.scope.split(' ');
      }
      return t;
    });
  },

  removeToken: function removeToken(id) {
    return this._write(QUERY_TOKEN_DELETE, [buf(id)]);
  },

  getEncodingInfo: function getEncodingInfo() {
    var info = {};

    var me = this;
    var qry = 'SHOW VARIABLES LIKE "%character\\_set\\_%"';
    return this._read(qry).then(function(rows) {
      /*jshint camelcase:false*/
      rows.forEach(function(row) {
        info[row.Variable_name] = row.Value;
      });

      qry = 'SHOW VARIABLES LIKE "%collation\\_%"';
      return me._read(qry).then(function(rows) {
        rows.forEach(function(row) {
          info[row.Variable_name] = row.Value;
        });
        return info;
      });
    });
  },

  removeUser: function removeUser(userId) {
    // TODO this should be a transaction or stored procedure
    var id = buf(userId);
    return this._write(QUERY_TOKEN_DELETE_USER, [id])
      .then(this._write.bind(this, QUERY_CODE_DELETE_USER, [id]));
  },

  _write: function _write(sql, params) {
    return this._query(this._pool, sql, params);
  },

  _read: function _read(sql, params) {
    return this._query(this._pool, sql, params);
  },

  _readOne: function _readOne(sql, params) {
    return this._read(sql, params).then(firstRow);
  },

  _getConnection: function _getConnection() {
    // see bluebird.using()/disposer():
    // https://github.com/petkaantonov/bluebird/blob/master/API.md#resource-management
    //
    // tl;dr: using() and disposer() ensures that the dispose method will
    // ALWAYS be called at the end of the promise stack, regardless of
    // various errors thrown. So this should ALWAYS release the connection.
    var pool = this._pool;
    return new P(function(resolve, reject) {
      pool.getConnection(function(err, conn) {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    }).disposer(releaseConn);
  },

  _query: function _query(connection, sql, params) {
    return new P(function(resolve, reject) {
      connection.query(sql, params || [], function(err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
};

module.exports = MysqlStore;
