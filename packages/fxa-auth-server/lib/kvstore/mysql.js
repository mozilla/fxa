/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * KVStore implementation backed by mysql.
 *
 */

const mysql = require('../mysql/wrapper.js');
const config = require('../config');
const Hapi = require('hapi');
const kvstore = require('../kvstore');

var client;

const schema =
  "CREATE TABLE IF NOT EXISTS kvstore (" +
    "kv_key VARCHAR(255) NOT NULL UNIQUE, " +
    "kv_value MEDIUMTEXT NOT NULL," +
    "kv_casid INTEGER NOT NULL" +
    ") ENGINE=InnoDB;"
;

module.exports = {

  connect: function(cfg, connectCB) {
    if (client) return connectCB(null, {get: get, set: set, cas: cas, delete: del});

    cfg = Hapi.utils.merge(cfg, config.get('mysql'));

    var options = {};

    // Get the relevant client options from the mysql config
    ['host', 'port', 'user', 'password', 'database'].forEach(function(param) {
      options[param] = cfg[param];
    });

    // Helper function for connecting to MySQL.
    //
    // XXX TODO: connection pooling
    function connect(cb) {
      client = mysql.createClient(options);

      client.on('error', function(err) {
        if (cb) {
          cb(err);
          cb = null;
        }
      });

      return cb(null);
    }

    function createSchema(cb) {
      var database = options.database;
      // don't specify the database yet -- it shouldn't exist
      delete options.database;
      var createClient = mysql.createClient(options);

      createClient.query("CREATE DATABASE IF NOT EXISTS " + database, function(err) {
        if (err) return cb(err);
        createClient.useDatabase(database, function(err) {
          if (err) return cb(err);
          createClient.query(schema, function(err) {
            if (err) return cb(err);
            // reset the database name
            options.database = database;
            connect(cb);
          });
        });
      });
    }

    function get(key, cb) {
      var query = "SELECT kv_value, kv_casid FROM kvstore WHERE kv_key = ?";
      client.query(query, [key], function(err, results) {
        if (err) return cb(err);
        if (!results.length) return cb(null, null);

        var value, error = null;

        try {
          value = JSON.parse(results[0].kv_value);
        } catch(e) {
          error = e;
        }

        return cb(error, {
          value: value,
          casid: results[0].kv_casid
        });
      });
    }

    function set(key, value, cb) {
      var query = "INSERT INTO kvstore (kv_key, kv_value, kv_casid)" +
                  " VALUES (?, ?, 0)" +
                  " ON DUPLICATE KEY UPDATE" +
                  " kv_value=VALUES(kv_value), kv_casid = kv_casid + 1";
      client.query(query, [key, JSON.stringify(value)], function(err) {
        return cb(err);
      });
    }

    function cas(key, value, casid, cb) {
      var query;
      var args = [JSON.stringify(value), key];
      if (casid === null) {
        query = "INSERT INTO kvstore (kv_value, kv_key, kv_casid)" +
                " VALUES (?, ?, 0)";
      } else {
        query = "UPDATE kvstore SET kv_value=?, kv_casid=kv_casid+1" +
                " WHERE kv_key = ? and kv_casid = ?";
        args.push(casid);
      }
      client.query(query, args, function(err, result) {
        // XXX TODO: check for a constraint violation if casid == null.
        if (casid !== null && result.affectedRows === 0) err = kvstore.ERROR_CAS_MISMATCH;
        if (err) console.log(err);
        return cb(err);
      });
    }

    function del(key, cb) {
      var query = "DELETE FROM kvstore WHERE kv_key=?";
      client.query(query, [key], function(err) {
        return cb(err);
      });
    }

    function returnClientCallback (err) {
      connectCB(err, {get: get, set: set, cas: cas, delete: del});
    }

    if (cfg.create_schema) {
      createSchema(returnClientCallback);
    } else {
      connect(returnClientCallback);
    }
  },

  close: function(cb) {
    client.end(function(err) {
      client = undefined;
      if (err) console.error(err);
      if (cb) cb(err);
    });
  },

  closeAndRemove: function(cb) {
    client.query("DROP DATABASE " + "test", function() {
      module.exports.close(cb);
    });
  }
};
