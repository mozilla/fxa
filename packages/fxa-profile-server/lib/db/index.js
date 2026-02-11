/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../promise');

const config = require('../config');
const logger = require('../logging')('db');

const klass =
  config.get('db.driver') === 'mysql'
    ? require('./mysql')
    : require('./memory');

/**
 * Ensure that the database contains references
 * for all the avatar providers mentioned in config.
 */
function initializeProvidersFromConfig(store) {
  var providers = Object.keys(config.get('img.providers'));
  logger.debug('providers.from-config', { providers: providers });
  return P.all(
    providers.map((name) => {
      return store.getProviderByName(name).then((provider) => {
        if (provider) {
          logger.debug('providers.exists', { name: name });
        } else {
          return store.addProvider(name);
        }
      });
    })
  );
}

let driverPromise;
let driver;

/**
 * Return a promise of a database instance,
 * using the existing instance if available
 * but creating a new one if necessary.
 */
function withDriver() {
  if (driver) {
    return P.resolve(driver);
  }
  if (driverPromise) {
    return driverPromise;
  }
  let connectPromise;
  if (config.get('db.driver') === 'mysql') {
    connectPromise = klass.connect(config.get('mysql'));
  } else {
    connectPromise = klass.connect();
  }
  driverPromise = connectPromise.then((store) => {
    logger.debug('connected', config.get('db.driver'));
    return initializeProvidersFromConfig(store).then(() => {
      driver = store;
      driverPromise = null;
      return driver;
    });
  });
  return driverPromise;
}

/**
 * Shut down the active database instance, if any.
 * Calls to the DB after this function has completed,
 * will automatically create a fresh new instance.
 */
exports.finalize = function finalize() {
  if (driver) {
    const d = driver;
    driver = null;
    return d.disconnect();
  }
  if (driverPromise) {
    const dPromise = driverPromise;
    driverPromise = null;
    return dPromise.then((d) => {
      return d.disconnect();
    });
  }
  return P.resolve();
};

/**
 * Clear database state and shutdown the active instance.
 * This is used by tests during their teardown phase.
 */
exports._teardown = function _teardown() {
  return exports._clear().then(() => {
    return exports.finalize();
  });
};

/**
 * Automagically proxy a call to the named method
 * through to the active db instance, creating it
 * if necessary.
 */
function proxy(method) {
  return function proxied() {
    const args = arguments;
    return withDriver()
      .then((driver) => {
        if (logger.isEnabledFor(logger.VERBOSE)) {
          logger.verbose('proxy', {
            method: method,
            args: [].slice.call(args),
          });
        }
        let ret = driver[method].apply(driver, args);
        if (logger.isEnabledFor(logger.VERBOSE)) {
          ret = ret.then((val) => {
            logger.verbose('proxied', { method: method, ret: val });
            return val;
          });
        }
        return ret;
      })
      .catch((err) => {
        logger.error('proxy.error.' + method, err);
        throw err;
      });
  };
}

Object.keys(klass.prototype).forEach((key) => {
  exports[key] = proxy(key);
});
