/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const config = require('../config');
const kvstore = require('../kvstore');
const Memcached = require('memcached');

var client;
var lifetime = 0;

function get(key, cb) {
  client.gets(key,
    function (err, result) {
      if (err) { cb(err); }
      else if (!result) { cb(null, null); }
      else {
        cb(null,
          {
            value: result[key],
            casid: +(result.cas)
          }
        );
      }
    }
  );
}

function set(key, value, cb) {
  client.set(key, value, lifetime,
    function (err, result) {
      if (err) { cb(err); }
      else if (!result) { cb('NOT SET'); }
      else { cb(null); }
    }
  );
}

function cas(key, value, casid, cb) {
  client.cas(key, value, casid, lifetime,
    function (err, result) {
      if (err) { cb(err); }
      else if (!result) { cb(kvstore.ERROR_CAS_MISMATCH); }
      else { cb(null); }
    }
  );
}

function del(key, cb) {
  client.del(
    key,
    function (err) {
      cb(err);
    }
  );
}

module.exports = {
  connect: function (options, callback) {
    if (!client) {
      options = Hapi.utils.merge(options, config.get('memcached'));
      client = new Memcached(options.hosts, options);
      lifetime = options.lifetime;
    }
    var api = {
      get: get,
      set: set,
      cas: cas,
      delete: del
    };
    callback(null, api);
  },
  close: function (cb) {
    if (client) {
      client.end();
    }
    if (cb) { cb(); }
  }
};
