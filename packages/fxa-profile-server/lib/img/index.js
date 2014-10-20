/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

const P = require('../promise');
const config = require('../config');
const logger = require('../logging')('img');

const klass = config.get('img.driver') === 'aws' ?
  require('./aws') : require('./local');

function unique() {
  return crypto.randomBytes(16).toString('hex');
}

var driver;
function withDriver() {
  if (driver) {
    return P.resolve(driver);
  }
  var p;
  if (config.get('img.driver') === 'aws') {
    p = klass.connect();
  } else {
    p = klass.connect();
  }
  return p.then(function(store) {
    store.id = unique;
    logger.debug('connected', config.get('img.driver'));
    return driver = store;
  });
}

function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver().then(function withDriverProxiedThen(driver) {
      logger.verbose('proxied', { method: method, args: args.length });
      return driver[method].apply(driver, args);
    }).catch(function(err) {
      logger.error('proxied.error.' + method, err);
      throw err;
    });
  };
}
Object.keys(klass.prototype).forEach(function(key) {
  if (typeof klass.prototype[key] === 'function') {
    exports[key] = proxy(key);
  }
});

exports.id = unique;
