/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mysql = require('mysql');

const logger = require('../logging').getLogger('fxa.db.mysql');
const P = require('../promise');

const SCHEMA = require('fs').readFileSync(__dirname + '/schema.sql').toString();
const PROFILE_GET_QUERY = 'SELECT * FROM profiles WHERE uid=?';
const PROFILE_EXISTS_QUERY = 'SELECT uid FROM profiles WHERE uid=?';
const PROFILE_CREATE_QUERY = 'INSERT INTO profiles (uid, avatar) VALUES (?, ?)';
const AVATAR_SET_QUERY = 'UPDATE profiles SET avatar=? WHERE uid=?';

function MysqlStore(options) {
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
  var store = new MysqlStore(options);
  if (options.createSchema) {
    return createSchema(store._connection, options).then(function() {
      return store;
    });
  }
  return P.resolve(store);
};


MysqlStore.prototype = {
  profileExists: function profileExists(id) {
    var defer = P.defer();
    this._connection.query(PROFILE_EXISTS_QUERY, [id], function(err, rows) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(!!rows[0]);
      }
    });
    return defer.promise;
  },
  createProfile: function createProfile(profile) {
    var defer = P.defer();
    this._connection.query(PROFILE_CREATE_QUERY,
      [profile.uid, profile.avatar], defer.callback);
    return defer.promise;
  },
  getProfile: function getProfile(id) {
    var defer = P.defer();
    this._connection.query(PROFILE_GET_QUERY, [id], function(err, rows) {
      if (err) {
        return defer.reject(err);
      }
      var result = rows[0];
      if (result) {

        defer.resolve({
          uid: result.uid,
          avatar: result.avatar
        });
      } else {
        defer.resolve();
      }
    });
    return defer.promise;
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
  setAvatar: function setAvatar(uid, url) {
    var conn = this._connection;
    return this.profileExists(uid).then(function(exists) {
      if (!exists) {
        throw new Error('User (' + uid + ') does not exist');
      }
      var defer = P.defer();
      conn.query(AVATAR_SET_QUERY, [url, uid], defer.callback);
      return defer.promise;
    });
  }
};

module.exports = MysqlStore;
