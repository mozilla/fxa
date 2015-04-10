/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const mysql = require('mysql');
const buf = require('buf').hex;
const MysqlPatcher = require('mysql-patcher');

const AppError = require('../../error');
const config = require('../../config');
const logger = require('../../logging')('db.mysql');
const P = require('../../promise');
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


const Q_AVATAR_INSERT = 'INSERT INTO avatars (id, url, userId, providerId) ' +
  'VALUES (?, ?, ?, ?)';
const Q_AVATAR_UPDATE = 'INSERT INTO avatar_selected (userId, avatarId) '
  + 'VALUES (?, ?) ON DUPLICATE KEY UPDATE avatarId = VALUES(avatarId)';
const Q_AVATAR_GET = 'SELECT * FROM avatars WHERE id=?';
const Q_SELECTED_AVATAR = 'SELECT avatars.* FROM avatars LEFT JOIN '
  + 'avatar_selected ON (avatars.id = avatar_selected.avatarId) WHERE '
  + 'avatars.userId=? AND avatar_selected.avatarId IS NOT NULL';
const Q_AVATAR_LIST = 'SELECT avatars.id, url, avatar_selected.avatarId '
  + 'IS NOT NULL AS selected FROM avatars LEFT JOIN avatar_selected ON '
  + '(avatars.id = avatar_selected.avatarId) WHERE avatars.userId=?';
const Q_AVATAR_DELETE = 'DELETE FROM avatars WHERE id=?';

const Q_PROVIDER_INSERT = 'INSERT INTO avatar_providers (name) VALUES (?)';
const Q_PROVIDER_GET_BY_NAME = 'SELECT * FROM avatar_providers WHERE name=?';
const Q_PROVIDER_GET_BY_ID = 'SELECT * FROM avatar_providers WHERE id=?';

const Q_PROFILE_DISPLAY_NAME_UPDATE = 'INSERT INTO profile ' +
  '(userId, displayName) VALUES (?, ?) ON DUPLICATE KEY UPDATE ' +
  'displayName = VALUES(displayName)';
const Q_PROFILE_DISPLAY_NAME_GET = 'SELECT displayName FROM profile ' +
  'WHERE userId=?';

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
            logger.error('ping', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  },

  addAvatar: function addAvatar(id, uid, url, provider, selected) {
    id = buf(id);
    uid = buf(uid);
    var store = this;
    return this.getProviderByName(provider).then(function(prov) {
      if (!prov) {
        throw AppError.unsupportedProvider(url);
      }
      var p = store._write(Q_AVATAR_INSERT, [id, url, uid, prov.id]);
      if (selected) {
        p = p.then(function() {
          return store._write(Q_AVATAR_UPDATE, [uid, id]);
        });
      }

      return p;
    });
  },

  getAvatar: function getAvatar(id) {
    return this._readOne(Q_AVATAR_GET, [buf(id)]);
  },

  getSelectedAvatar: function getSelectedAvatar(uid) {
    return this._readOne(Q_SELECTED_AVATAR, [buf(uid)]);
  },

  getAvatars: function getAvatars(uid) {
    return this._read(Q_AVATAR_LIST, [buf(uid)]);
  },

  deleteAvatar: function deleteAvatar(id) {
    return this._write(Q_AVATAR_DELETE, [buf(id)]);
  },

  addProvider: function addProvider(name) {
    return this._write(Q_PROVIDER_INSERT, [name]);
  },

  getProviderByName: function getProviderByName(name) {
    return this._readOne(Q_PROVIDER_GET_BY_NAME, [name]);
  },

  getProviderById: function getProviderById(id) {
    return this._readOne(Q_PROVIDER_GET_BY_ID, [id]);
  },

  setDisplayName: function setDisplayName(uid, displayName) {
    return this._write(Q_PROFILE_DISPLAY_NAME_UPDATE, [buf(uid), displayName]);
  },

  getDisplayName: function getDisplayName(uid) {
    return this._readOne(Q_PROFILE_DISPLAY_NAME_GET, [buf(uid)]);
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

if (config.get('env') === 'test') {
  MysqlStore.prototype._clear = function clear() {
    var store = this;
    return this._write('DELETE FROM avatar_selected;')
      .then(function() {
        return store._write('DELETE FROM avatars;');
      })
      .then(function() {
        return store._write('DELETE FROM avatar_providers;');
      });
  };
}

module.exports = MysqlStore;
