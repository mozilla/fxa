/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../promise');

const config = require('../config');
const logger = require('../logging').getLogger('fxa.db');
const mysql = require('./mysql');
const memory = require('./memory');

function buffer(obj) {
  if (Buffer.isBuffer(obj)) {
    return obj;
  } else if (typeof obj === 'string') {
    return Buffer(obj, 'hex');
  }
}

function unbuf(buf) {
  if (Buffer.isBuffer(buf)) {
    return buf.toString('hex');
  }
  return buf;
}

function preClients() {
  var clients = config.get('clients');
  if (clients && clients.length) {
    logger.debug('Loading pre-defined clients: %:2j', clients);
    return P.all(clients.map(function(c) {
      return exports.getClient(c.id).then(function(client) {
        if (client) {
          logger.debug('Client %s exists, skipping', unbuf(c.id));
        } else {
          return exports.registerClient(c);
        }
      });
    }));
  }
}

var driver;
function withDriver() {
  if (driver) {
    return P.resolve(driver);
  }
  var p;
  if (config.get('db.driver') === 'mysql') {
    p = mysql.connect(config.get('mysql'));
  } else {
    p = memory.connect();
  }
  return p.then(function(store) {
    logger.debug('connected to "%s" store', config.get('db.driver'));
    store._unbuf = unbuf;
    store._buf = buffer;
    driver = store;
  }).then(preClients).then(function() {
    return driver;
  });
}

const proxyReturn = logger.isEnabledFor(logger.VERBOSE) ?
  function verboseReturn(promise, method) {
    return promise.then(function(ret) {
      logger.verbose('proxied %s < %j', method, ret);
      return ret;
    });
  } : function identity(x) {
    return x;
  };

function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver().then(function(driver) {
      logger.verbose('proxying %s > %j', method, args);
      return proxyReturn(driver[method].apply(driver, args), method);
    }).catch(function(err) {
      logger.error('%s: %s', method, err);
      throw err;
    });
  };
}


Object.keys(mysql.prototype).forEach(function(key) {
  exports[key] = proxy(key);
});

exports.disconnect = function disconnect() {
  driver = null;
};

exports._initialClients = function() {
  return preClients();
};
