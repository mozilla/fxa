/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../promise');

const config = require('../config');
const logger = require('../logging')('db');

const klass = config.get('db.driver') === 'mysql' ?
  require('./mysql') : require('./memory');

function loadProviders() {
  var providers = Object.keys(config.get('img.providers'));
  logger.debug('providers.from-config', { providers: providers });
  return P.all(providers.map(function(name) {
    return exports.getProvider(name).then(function(provider) {
      if (provider) {
        logger.debug('providers.exists',  { name: name });
      } else {
        return exports.addProvider(name);
      }
    });
  }));
}

var driver;
function withDriver() {
  if (driver) {
    return P.resolve(driver);
  }
  var p;
  if (config.get('db.driver') === 'mysql') {
    p = klass.connect(config.get('mysql'));
  } else {
    p = klass.connect();
  }
  return p.then(function(store) {
    logger.debug('connected', config.get('db.driver'));
    driver = store;
  }).then(loadProviders).then(function() {
    return driver;
  });
}

function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver().then(function proxiedWithDriverThen(driver) {
      logger.verbose('proxied', { method: method, args: [].slice.call(args) });
      return driver[method].apply(driver, args);
    }).catch(function(err) {
      logger.error('proxied.error.' + method, err);
      throw err;
    });
  };
}
Object.keys(klass.prototype).forEach(function(key) {
  exports[key] = proxy(key);
});

exports.disconnect = function disconnect() {
  driver = null;
};
