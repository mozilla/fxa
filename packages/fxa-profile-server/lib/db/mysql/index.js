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

const REQUIRED_SQL_MODES = ['STRICT_ALL_TABLES', 'NO_ENGINE_SUBSTITUTION'];
const REQUIRED_CHARSET = 'UTF8MB4_BIN';

function MysqlStore(options) {
  if (options.charset && options.charset !== REQUIRED_CHARSET) {
    logger.error('createDatabase.invalidCharset', { charset: options.charset });
    throw new Error('You cannot use any charset besides ' + REQUIRED_CHARSET);
  } else {
    options.charset = REQUIRED_CHARSET;
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

    // We can run if we're at or above some patch level.  Should be
    // equal at initial deployment, and may be one or more higher
    // later on, due to database changes in preparation for the next
    // release.
    if (patcher.currentPatchLevel >= patch.level) {
      return d.resolve();
    }

    err = 'unexpected db patch level: ' + patcher.currentPatchLevel;
    return d.reject(new Error(err));
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

  return P.promisify(patcher.connect, { context: patcher })()
    .then(function() {
      if (options.createSchema) {
        return updateDbSchema(patcher);
      }
    })
    .then(function() {
      return checkDbPatchLevel(patcher);
    })
    .then(function() {
      return P.promisify(patcher.end, { context: patcher })();
    })
    .then(function() {
      return new MysqlStore(options);
    });
};

const Q_AVATAR_INSERT =
  'INSERT INTO avatars (id, url, userId, providerId) ' + 'VALUES (?, ?, ?, ?)';
const Q_AVATAR_UPDATE =
  'INSERT INTO avatar_selected (userId, avatarId) ' +
  'VALUES (?, ?) ON DUPLICATE KEY UPDATE avatarId = VALUES(avatarId)';
const Q_AVATAR_GET = 'SELECT * FROM avatars WHERE id=?';
const Q_SELECTED_AVATAR =
  'SELECT avatars.* FROM avatars LEFT JOIN ' +
  'avatar_selected ON (avatars.id = avatar_selected.avatarId) WHERE ' +
  'avatars.userId=? AND avatar_selected.avatarId IS NOT NULL';
const Q_AVATAR_DELETE = 'DELETE FROM avatars WHERE id=?';

const Q_PROVIDER_INSERT = 'INSERT INTO avatar_providers (name) VALUES (?)';
const Q_PROVIDER_GET_BY_NAME = 'SELECT * FROM avatar_providers WHERE name=?';
const Q_PROVIDER_GET_BY_ID = 'SELECT * FROM avatar_providers WHERE id=?';

const Q_PROFILE_DISPLAY_NAME_UPDATE =
  'INSERT INTO profile ' +
  '(userId, displayName) VALUES (?, ?) ON DUPLICATE KEY UPDATE ' +
  'displayName = VALUES(displayName)';
const Q_PROFILE_DISPLAY_NAME_GET =
  'SELECT displayName FROM profile ' + 'WHERE userId=?';
const Q_PROFILE_DELETE = 'DELETE FROM profile WHERE userId=?';

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

  addAvatar: function addAvatar(id, uid, url, provider) {
    id = buf(id);
    uid = buf(uid);
    var store = this;
    return this.getProviderByName(provider).then(function(prov) {
      if (! prov) {
        throw AppError.unsupportedProvider(url);
      }

      return store
        ._write(Q_AVATAR_INSERT, [id, url, uid, prov.id])
        .then(function() {
          // always select the newly uploaded avatar
          return store._write(Q_AVATAR_UPDATE, [uid, id]);
        });
    });
  },

  getAvatar: function getAvatar(id) {
    return this._readOne(Q_AVATAR_GET, [buf(id)]);
  },

  getSelectedAvatar: function getSelectedAvatar(uid) {
    return this._readOne(Q_SELECTED_AVATAR, [buf(uid)]);
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

  removeProfile: function removeProfile(uid) {
    return this._write(Q_PROFILE_DELETE, [buf(uid)]);
  },

  _write: function _write(sql, params) {
    return this._query(sql, params);
  },

  _read: function _read(sql, params) {
    return this._query(sql, params);
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
          return reject(err);
        }
        if (conn._fxa_initialized) {
          return resolve(conn);
        }
        // Enforce sane defaults on every new connection.
        // These *should* be set by the database by default, but it's nice
        // to have an additional layer of protection here.
        conn.query('SELECT @@sql_mode AS mode', function(err, rows) {
          if (err) {
            return reject(err);
          }
          var modes = rows[0]['mode'].split(',');
          var needToSetMode = false;
          REQUIRED_SQL_MODES.forEach(function(requiredMode) {
            if (modes.indexOf(requiredMode) === -1) {
              modes.push(requiredMode);
              needToSetMode = true;
            }
          });
          if (! needToSetMode) {
            conn._fxa_initialized = true;
            return resolve(conn);
          }
          var mode = modes.join(',');
          conn.query("SET SESSION sql_mode = '" + mode + "'", function(err) {
            if (err) {
              return reject(err);
            }

            conn.query('SET NAMES utf8mb4 COLLATE utf8mb4_bin;', function(err) {
              if (err) {
                return reject(err);
              }

              conn._fxa_initialized = true;
              return resolve(conn);
            });
          });
        });
      });
    }).disposer(releaseConn);
  },

  _query: function _query(sql, params) {
    return P.using(this._getConnection(), function(conn) {
      return new P(function(resolve, reject) {
        conn.query(sql, params || [], function(err, results) {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });
  },

  disconnect: function disconnect() {
    return new P((resolve, reject) => {
      this._pool.end(err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  },
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
