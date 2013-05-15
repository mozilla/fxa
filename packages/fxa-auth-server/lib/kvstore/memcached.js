/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const config = require('../config');
const kvstore = require('../kvstore');
const Memcached = require('memcached');

function MemcachedStore(options) {
  this.client = new Memcached(options.hosts, options);
  this.lifetime = options.lifetime;
}

MemcachedStore.prototype.get = function get(key, cb) {
  this.client.gets(key,
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
};

MemcachedStore.prototype.set = function set(key, value, cb) {
  this.client.set(key, value, this.lifetime,
    function (err, result) {
      if (err) { cb(err); }
      else if (!result) { cb('NOT SET'); }
      else { cb(null); }
    }
  );
};

MemcachedStore.prototype.cas = function cas(key, value, casid, cb) {
  this.client.cas(key, value, casid, this.lifetime,
    function (err, result) {
      if (err) { cb(err); }
      else if (!result) { cb(kvstore.ERROR_CAS_MISMATCH); }
      else { cb(null); }
    }
  );
};

MemcachedStore.prototype.del = function del(key, cb) {
  this.client.del(
    key,
    function (err) {
      cb(err);
    }
  );
};

MemcachedStore.prototype.close = function close(cb) {
  this.client.end();
  if (cb) cb();
};

module.exports = {
  connect: function (options, callback) {
    options = Hapi.utils.merge(options, config.get('memcached'));
    callback(null, new MemcachedStore(options));
  }
};
