/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

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

let driver;
async function withDriver() {
  if (driver) {
    return Promise.resolve(driver);
  }

  const store = await klass.connect();
  store.id = unique;
  logger.debug('connected', config.get('img.driver'));
  // eslint-disable-next-line require-atomic-updates
  return (driver = store); // eslint-disable-line no-return-assign
}

function proxy(method) {
  return async function proxied() {
    const args = arguments;
    try {
      const driver = await withDriver();
      logger.verbose('proxied', { method: method, args: args.length });
      return driver[method].apply(driver, args);
    } catch (err) {
      logger.error('proxied.error.' + method, err);
      throw err;
    }
  };
}
Object.keys(klass.prototype).forEach(function(key) {
  if (typeof klass.prototype[key] === 'function') {
    exports[key] = proxy(key);
  }
});

exports.id = unique;
