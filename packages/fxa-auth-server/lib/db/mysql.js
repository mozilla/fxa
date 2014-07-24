/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const buf = require('buf').hex;
const mysql = require('mysql');

const encrypt = require('../encrypt');
const logger = require('../logging').getLogger('fxa.db.mysql');
const P = require('../promise');
const unique = require('../unique');

const SCHEMA = require('fs').readFileSync(__dirname + '/schema.sql').toString();

function MysqlStore(options) {
  if (options.charset && options.charset !== 'UTF8_UNICODE_CI') {
    logger.warn('createDatabase: using charset ' + options.charset);
  } else {
    options.charset = 'UTF8_UNICODE_CI';
  }
  this._connection = mysql.createConnection(options);
}

function createSchema(conn, options) {
  logger.verbose('createSchema', options);

  var d = P.defer();
  var database = options.database;

  logger.verbose('createDatabase');
  var createDatabaseQuery =
    'CREATE DATABASE IF NOT EXISTS ' + database +
    ' CHARACTER SET utf8 COLLATE utf8_unicode_ci';

  conn.query(createDatabaseQuery, function(err) {
      if (err) {
        logger.error('create database', err);
        return d.reject(err);
      }

      logger.verbose('changeUser');
      conn.changeUser({
        user: options.user,
        password: options.password,
        database: database
      }, function(err) {
        if (err) {
          logger.error('changeUser', err);
          return d.reject(err);
        }
        logger.verbose('creatingSchema');

        conn.query(SCHEMA, function(err) {
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
      return new MysqlStore(options);
    });
  } else {
    return P.resolve(new MysqlStore(options));
  }
};

const QUERY_CLIENT_REGISTER =
  'INSERT INTO clients (id, name, imageUri, secret, redirectUri, whitelisted)' +
  'VALUES (?, ?, ?, ?, ?, ?);';
const QUERY_CLIENT_GET = 'SELECT * FROM clients WHERE id=?';
const QUERY_CLIENT_DELETE = 'DELETE FROM clients WHERE id=?';
const QUERY_CODE_INSERT =
  'INSERT INTO codes (clientId, userId, email, scope, code) VALUES ' +
  '(?, ?, ?, ?, ?)';
const QUERY_TOKEN_INSERT =
  'INSERT INTO tokens (clientId, userId, email, scope, type, token) VALUES ' +
  '(?, ?, ?, ?, ?, ?)';
const QUERY_TOKEN_FIND = 'SELECT * FROM tokens WHERE token=?';
const QUERY_CODE_FIND = 'SELECT * FROM codes WHERE code=?';
const QUERY_CODE_DELETE = 'DELETE FROM codes WHERE code=?';
const QUERY_TOKEN_DELETE = 'DELETE FROM tokens WHERE token=?';

function firstRow(rows) {
  return rows[0];
}

MysqlStore.prototype = {

  ping: function ping() {
    logger.debug('ping');
    var conn = this._connection;
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
  },

  // createdAt is DEFAULT NOW() in the schema.sql
  registerClient: function registerClient(client) {
    var id;
    if (client.id) {
      logger.debug('registerClient: client already has ID?', client.id);
      id = buf(client.id);
    } else {
      id = unique.id();
    }
    logger.debug('registerClient', client.name, id.toString('hex'));
    return this._write(QUERY_CLIENT_REGISTER, [
      id,
      client.name,
      client.imageUri,
      client.hashedSecret,
      client.redirectUri,
      client.whitelisted
    ]).then(function() {
      logger.debug('registerClient: success [%s]', id.toString('hex'));
      client.id = id;
      return client;
    });
  },
  getClient: function getClient(id) {
    return this._readOne(QUERY_CLIENT_GET, [buf(id)]);
  },
  removeClient: function removeClient(id) {
    return this._write(QUERY_CLIENT_DELETE, [buf(id)]);
  },
  generateCode: function generateCode(clientId, userId, email, _scope) {
    var code = unique.code();
    var hash = encrypt.hash(code);
    var scope = _scope.join(' ');
    return this._write(QUERY_CODE_INSERT, [
      clientId,
      userId,
      email,
      scope,
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
  generateToken: function generateToken(code) {
    var t = {
      clientId: code.clientId,
      userId: code.userId,
      email: code.email,
      scope: code.scope,
      type: 'bearer'
    };
    var _token = unique.token();
    var me = this;
    return this.removeCode(code.code).then(function() {
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
