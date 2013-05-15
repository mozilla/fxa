/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Very lightly abstracted key-value storage for PiCL projects.
 *
 * This module provides a simple key-value storage API that abstracts away
 * the details of the underlying storage server.  It explicitly mirrors the
 * model used by the memcache protocol.  In production it's currently intended
 * to be mysql; for local development you can use an in-memory store.
 *
 * To obtain a database connection, call the connect() function:
 *
 *    var kvstore = require('lib/kvstore');
 *    var db = kvstore.connect({<options>});
 *
 * This function takes an options hash to specify details of the underlying
 * storage backend, and will fill in default options from runtime configuration
 * data.  It returns a connection object with the following methods:
 *
 *    get(key, cb(<err>, <res>)):
 *
 *      Get the data stored for the given key.  The result will be an object
 *      with field 'value' giving the stored value, and field 'casid' giving
 *      the current CAS id.  If the key does not exist then the result will be
 *      null.
 *
 *
 *    set(key, value, cb(<err>)):
 *
 *      Unconditionally set the data stored for the given key.
 *
 *
 *    cas(key, value, casid, cb(<err>)):
 *
 *      Check-and-set the data stored for the given key.  The 'casid' should be
 *      a value taken from a previous call to get() for that key, or null to
 *      check that the key does not exist.
 *
 *
 *    delete(key, cb(<err>)):
 *
 *      Unconditionally delete the data stored for the given key.  There is no
 *      conditional delete since AFAIK it's not offered by
 *      couchbase.
 *
 * Here's an example of how these methods might be used:
 *
 *  db.get("mydata", function(err, res) {
 *      if(err) throw err;
 *      console.log("My data is currently: " + res.value);
 *      db.cas("mydata", res.value + "newdata", res.casid, function(err) {
 *          if(err) throw "oh noes there was a write conflict";
 *      });
 *  });
 *
 * Each of the connection methods will transparently block until the underlying
 * storage backend connection is established, which allows calls to connect()
 * to be made synchronously.  If you need to be notified when the underlying
 * connection has been established, pass a callback to connect() like so:
 *
 *    kvstore.connect({<options>}, function(err, db) {
 *        ...do stuff with the db...
 *    }
 *
 */

var config = require('./config');
var hoek = require('hoek');


// The set of default options to use for new db connections in this process.
var DEFAULT_OPTIONS = config.get('kvstore');


// The set of available backend names.
// This will be populated with the loaded sub-modules on demand.
var AVAILABLE_BACKENDS = DEFAULT_OPTIONS.available_backends.reduce(
  function(map, backend) {
    map[backend] = null;
    return map;
  }, {});


module.exports = {
  ERROR_CAS_MISMATCH: 'cas mismatch',

  connect: function(options, cb) {
    options = hoek.applyToDefaults(DEFAULT_OPTIONS, options || {});

    // Load the specified backend implementation
    // if it's not already available.
    var backend = AVAILABLE_BACKENDS[options.backend];
    if(backend === undefined) {
        cb("invalid kvstore backend: " + backend);
        return;
    }
    if(backend === null) {
        backend = require("./kvstore/" + options.backend + ".js");
        AVAILABLE_BACKENDS[options.backend] = backend;
    }

    // Create a blocking proxy object to return from this function.
    // It will act just like the underlying backend connection, but
    // all method calls will block until the connection is established.
    var proxy = makeBlockingProxy();

    // Connect via the backend implementation, and have it unblock
    // the proxy object upon completion.
    backend.connect(options, function(err, db) {
      proxy._unblock(err, db);
      if (cb) cb(err, db);
    });

    return proxy;
  }
};


// Function to create a blocking proxy for a yet-to-be-established connection.
// This returns an object that looks and acts just like a kvstore connection,
// but whose method calls all transparently block until a real connection (or
// connection error) is provided asynchronously.
//
function makeBlockingProxy() {
  // The proxy object to return.
  var proxy = {};

  // Variables to hold the connection, or connection error, once established.
  var dbConnection = null;
  var dbError = null;

  // List of calls that are blocked waiting for the connection to be provided.
  var waitList = [];

  // Create a transparently-blocking method that proxies to the named method
  // on the underlying connection.
  //
  function makeBlockingMethod(methodName) {
    return function() {
      if (dbConnection !== null) {
        // The connection is ready, immediately call the underlying method.
        dbConnection[methodName].apply(dbConnection, arguments);
      } else if (dbError !== null) {
        // The connection errored out, call the callback with an error.
        // All kvstore methods take a callback as their final argument.
        arguments[arguments.length - 1].call(undefined, dbError);
      } else {
        // The connection is pending, add this call to the waitlist.
        waitList.push({ methodName: methodName, arguments: arguments });
      }
    };
  }
  proxy.get = makeBlockingMethod("get");
  proxy.set = makeBlockingMethod("set");
  proxy.cas = makeBlockingMethod("cas");
  proxy.delete = makeBlockingMethod("delete");

  // Private method which is called to provide the connection once established.
  // This will continue execution of any waiting calls.
  //
  proxy._unblock = function _unblock(err, db) {
    // Record the connection or error into the closed-over variables.
    // If the connection was successful, optimize future use of the proxy
    // proxy by copying over methods from the underlying connection.
    if (err) {
      dbError = err;
    } else {
      dbConnection = db;
      proxy.get = db.get.bind(db);
      proxy.set = db.set.bind(db);
      proxy.cas = db.cas.bind(db);
      proxy.delete = db.delete.bind(db);
    }
    // Resume any calls that are waiting for the connection.
    // By re-calling the named method on the proxy object, we avoid duplicating
    // the connection-or-error fulfillment logic from makeBlockingMethod().
    waitList.forEach(function(blockedCall) {
      process.nextTick(function() {
        proxy[blockedCall.methodName].apply(proxy, blockedCall.arguments);
      });
    });
    // Clean up so that things can be GC'd.
    waitList = null;
    delete proxy._unblock;
  };
 
  return proxy;
}
