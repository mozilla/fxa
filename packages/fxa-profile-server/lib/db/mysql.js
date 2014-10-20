/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mysql = require('mysql');
const buf = require('buf').hex;

const AppError = require('../error');
const config = require('../config');
const logger = require('../logging')('db.mysql');
const P = require('../promise');

const SCHEMA = require('fs').readFileSync(__dirname + '/schema.sql').toString();

function MysqlStore(options) {
  if (options.charset && options.charset !== 'UTF8_UNICODE_CI') {
    logger.warn('createDatabase', { charset:  options.charset });
  } else {
    options.charset = 'UTF8_UNICODE_CI';
  }
  this._pool = mysql.createPool(options);
}

function createSchema(client, options) {
  logger.verbose('createSchema', options);

  var d = P.defer();
  var database = options.database;

  logger.verbose('createDatabase', database);
  client.query('CREATE DATABASE IF NOT EXISTS ' + database
    + ' CHARACTER SET utf8 COLLATE utf8_unicode_ci', function(err) {
      if (err) {
        logger.error('createDatabase', err);
        return d.reject(err);
      }

      logger.verbose('changeUser');
      client.changeUser({
        user: options.user,
        password: options.password,
        database: database
      }, function(err) {
        if (err) {
          logger.error('changeUser', err);
          return d.reject(err);
        }
        logger.verbose('creatingSchema');

        client.query(SCHEMA, function(err) {
          if (err) {
            logger.error('creatingSchema', err);
            return d.reject(err);
          }
          d.resolve();
        });
      });
    });
  return d.promise;
}

MysqlStore.connect = function mysqlConnect(options) {
  if (options.createSchema) {
    // ugly, but you can't connect to a database before the database actually
    // exists. So remove and restore it later.
    var database = options.database;
    delete options.database;

    options.multipleStatements = true;
    var schemaConn = mysql.createConnection(options);
    options.database = database;

    return createSchema(schemaConn, options).then(function() {
      schemaConn.end();
      delete options.multipleStatements;
      options.database = database;
      return new MysqlStore(options);
    });
  } else {
    return P.resolve(new MysqlStore(options));
  }
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
const Q_PROVIDER_GET = 'SELECT * FROM avatar_providers WHERE name=?';

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
    return this.getProvider(provider).then(function(prov) {
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

  getProvider: function getProvider(name) {
    return this._readOne(Q_PROVIDER_GET, [name]);
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
