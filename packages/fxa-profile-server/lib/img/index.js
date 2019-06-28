/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

const P = require('../promise');
const config = require('../config');
const logger = require('../logging')('img');

const klass =
  config.get('img.driver') === 'aws' ? require('./aws') : require('./local');

exports.SIZES = Object.seal({
  small: { w: 100, h: 100 },
  default: { w: 200, h: 200 },
  large: { w: 600, h: 600 },
});

function unique() {
  return crypto.randomBytes(16).toString('hex'); // eslint-disable-line fxa/async-crypto-random
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
    return (driver = store); // eslint-disable-line no-return-assign
  });
}

function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver()
      .then(function withDriverProxiedThen(driver) {
        logger.verbose('proxied', { method: method, args: args.length });
        return driver[method].apply(driver, args);
      })
      .catch(function(err) {
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
