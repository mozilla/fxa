/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mysql = require('mysql');
const buf = require('buf').hex;

const img = require('../img');
const logger = require('../logging').getLogger('fxa.db.mysql');
const P = require('../promise');

const SCHEMA = require('fs').readFileSync(__dirname + '/schema.sql').toString();

function MysqlStore(options) {
  if (options.charset && options.charset !== 'UTF8_UNICODE_CI') {
    logger.warn('createDatabase: using charset ' + options.charset);
  } else {
    options.charset = 'UTF8_UNICODE_CI';
  }
  this._connection = mysql.createConnection(options);
}

function createSchema(client, options) {
  logger.verbose('createSchema', options);

  var d = P.defer();
  var database = options.database;

  logger.verbose('createDatabase');
  client.query('CREATE DATABASE IF NOT EXISTS ' + database
    + ' CHARACTER SET utf8 COLLATE utf8_unicode_ci', function(err) {
      if (err) {
        logger.error('create database', err);
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

function firstRow(rows) {
  return rows[0];
}

const Q_AVATAR_INSERT = 'INSERT INTO avatars (id, url, uid) ' +
  'VALUES (?, ?, ?)';
const Q_AVATAR_UPDATE = 'INSERT INTO avatar_selected (userId, avatarId) '
  + 'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE avatarId = VALUES(avatarId)';
const Q_SELECTED_AVATAR = 'SELECT avatars.* FROM avatars LEFT JOIN '
  + 'avatar_selected ON (avatar_selected.avatarId=avatars.id AND '
  + 'avatar_selected.userId=?)';

MysqlStore.prototype = {

  addAvatar: function addAvatar(uid, url, provider, selected) {
    var id = img.id();
    var store = this;
    var p = this._write(Q_AVATAR_INSERT, [id, url, uid]);
    if (selected) {
      p = p.then(function() {
        return store._write(Q_AVATAR_UPDATE, [uid, id]);
      });
    }

    return p;
  },

  getSelectedAvatar: function getSelectedAvatar(uid) {
    return this._readOne(Q_SELECTED_AVATAR, [buf(uid)]);
  },

  getAvatars: function getAvatars(uid) {
    return P.resolve(uid);
  },

  _write: function _write(sql, params) {
    return this._query(this._connection, sql, params);
  },

  _read: function _read(sql, params) {
    return this._query(this._connection, sql, params);
  },

  _readOne: function _readOne(sql, params) {
    return this._read(sql, params).then(firstRow);
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
