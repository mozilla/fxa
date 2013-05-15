/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * KVStore implementation using in-memory data.
 *
 */

const hoek = require('hoek');
const kvstore = require('../kvstore');


// Hapi's clone function only works on objects.
// Wrap it so that other datatypes are returned unchanged.
function clone(value) {
  if (typeof value !== 'object') return value;
  return hoek.clone(value);
}

// This is the in-memory store for the data, shared across all connections.
// Each key maps to an object with keys 'value' and 'casid'.
// It's a very rough simulation of how memcache does its CAS.
var data = {};

module.exports = {

  connect: function(options, cb) {

    // Following the lead of couchbase node module, this is using closures
    // and simple objects rather than instantiating a prototype connection.

    function get(key, cb) {
      process.nextTick(function() {
        if (data[key] === undefined) {
          cb(null, null);
        } else {
          // take a copy so caller cannot modify our internal data structures.
          cb(null, {
            value: clone(data[key].value),
            casid: data[key].casid
          });
        }
      });
    }

    function set(key, value, cb) {
      value = clone(value);
      process.nextTick(function() {
        if (data[key] === undefined) {
            data[key] = {
              value: value,
              casid: 1
            };
        } else {
            data[key].value = value;
            data[key].casid++;
        }
        cb(null);
      });
    }

    function cas(key, value, casid, cb) {
      value = clone(value);
      process.nextTick(function() {
        if (data[key] === undefined) {
          if (casid !== null) return cb(kvstore.ERROR_CAS_MISMATCH);
          data[key] = {
            value: value,
            casid: 1
          };
        } else {
          if (data[key].casid !== casid)  return cb(kvstore.ERROR_CAS_MISMATCH);
          data[key].value = value;
          data[key].casid++;
        }
        cb(null);
      });
    }

    function del(key, cb) {
      process.nextTick(function() {
        delete data[key];
        cb(null);
      });
    }

    // use process.nextTick to make our api behave asynchronously
    process.nextTick(function() {
      cb(null, {get: get, set: set, cas: cas, delete: del});
    });
  }

};
