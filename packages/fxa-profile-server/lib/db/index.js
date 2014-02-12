/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('../promise');

const config = require('../config');
const logger = require('../logging').getLogger('fxa.db');
const mysql = require('./mysql');
const memory = require('./memory');

var driver;
function withDriver() {
  if (driver) {
    return Promise.resolve(driver);
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
  });
}

function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver().then(function(driver) {
      return driver[method].apply(driver, args);
    }).catch(function(err) {
      logger.error(err);
      throw err;
    });
  };
}
Object.keys(memory.prototype).forEach(function(key) {
  exports[key] = proxy(key);
});

exports.disconnect = function disconnect() {
  driver = null;
};
