/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../promise');

const config = require('../config');
const logger = require('../logging').getLogger('fxa.db');
const mysql = require('./mysql');
const memory = require('./memory');

function preClients(store) {
  var clients = config.get('clients');
  if (clients && clients.length) {
    logger.debug('Loading pre-defined clients: %:2j', clients);
    return P.all(clients.map(function(c) {
      c.id = Buffer(c.id, 'hex');
      return store.getClient(c.id).then(function(client) {
        if (client) {
          logger.debug('Client %s exists, skipping', c.id.toString('hex'));
        } else {
          return store.registerClient(c);
        }
      });
    })).then(function() {
      return store;
    });
  }
  return store;
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
    logger.debug('connected to [%s] store', config.get('db.driver'));
    return driver = store;
  }).then(preClients);
}


function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver().then(function(driver) {
      logger.verbose('proxying', method, [].slice.call(args));
      return driver[method].apply(driver, args);
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
