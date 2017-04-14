/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const unbuf = require('buf').unbuf.hex;

const P = require('../promise');

const config = require('../config');
const encrypt = require('../encrypt');
const logger = require('../logging')('db');
const klass = config.get('db.driver') === 'mysql' ?
  require('./mysql') : require('./memory');
const unique = require('../unique');

function clientEquals(configClient, dbClient) {
  var props = Object.keys(configClient);
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var configProp = unbuf(configClient[prop]);
    var dbProp = unbuf(dbClient[prop]);
    if (configProp !== dbProp) {
      logger.debug('clients.differ', {
        prop: prop,
        configProp: configProp,
        dbProp: dbProp
      });
      return false;
    }
  }
  return true;
}

function convertClientToConfigFormat(client) {
  var out = {};

  for (var key in client) {
    if (key === 'hashedSecret' || key === 'hashedSecretPrevious') {
      out[key] = unbuf(client[key]);
    } else if (key === 'trusted' || key === 'canGrant') {
      out[key] = !!client[key]; // db stores booleans as 0 or 1.
    } else if (typeof client[key] !== 'function') {
      out[key] = unbuf(client[key]);
    }
  }
  return out;
}

function preClients() {
  var clients = config.get('clients');
  if (clients && clients.length) {
    logger.debug('predefined.loading', { clients: clients });
    return P.all(clients.map(function(c) {
      if (c.secret) {
        console.error('Do not keep client secrets in the config file.' // eslint-disable-line no-console
          + ' Use the `hashedSecret` field instead.\n\n'
          + '\tclient=%s has `secret` field\n'
          + '\tuse hashedSecret="%s" instead',
          c.id,
          unbuf(encrypt.hash(c.secret)));
        return P.reject(new Error('Do not keep client secrets in the config file.'));
      }

      // ensure the required keys are present.
      var err = null;
      var REQUIRED_CLIENTS_KEYS = [ 'id', 'hashedSecret', 'name', 'imageUri',
                                    'redirectUri', 'trusted', 'canGrant' ];
      REQUIRED_CLIENTS_KEYS.forEach(function(key) {
        if (!(key in c)) {
          var data = { key: key, name: c.name || 'unknown' };
          logger.error('client.missing.keys', data);
          err = new Error('Client config has missing keys');
        }
      });
      if (err) {
        return P.reject(err);
      }

      // ensure booleans are boolean and not undefined
      c.trusted = !!c.trusted;
      c.canGrant = !!c.canGrant;

      // Modification of the database at startup in production and stage is
      // not preferred. This option will be set to false on those stacks.
      if (!config.get('db.autoUpdateClients')) {
        return P.resolve();
      }

      return exports.getClient(c.id).then(function(client) {
        if (client) {
          client = convertClientToConfigFormat(client);
          logger.info('client.compare', { id: c.id });
          if (clientEquals(client, c)) {
            logger.info('client.compare.equal', { id: c.id });
          } else {
            logger.warn('client.compare.differs', {
              id: c.id,
              before: client,
              after: c
            });
            return exports.updateClient(c);
          }
        } else {
          return exports.registerClient(c);
        }
      });
    }));
  } else {
    return P.resolve();
  }
}

function serviceClients() {
  var clients = config.get('serviceClients');
  if (clients && clients.length) {
    logger.debug('serviceClients.loading', clients);

    return P.all(clients.map(function(client) {
      return exports.getClient(client.id).then(function(existing) {
        if (existing) {
          logger.verbose('seviceClients.existing', client);
          return;
        }

        return exports.registerClient({
          id: client.id,
          name: client.name,
          hashedSecret: encrypt.hash(unique.secret()),
          imageUri: '',
          redirectUri: '',
          trusted: true,
          canGrant: false
        });
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
    p = klass.connect(config.get('mysql'));
  } else {
    p = klass.connect();
  }
  return p.then(function(store) {
    logger.debug('connected', { driver: config.get('db.driver') });
    driver = store;
  }).then(exports._initialClients).then(function() {
    return driver;
  });
}

const proxyReturn = logger.isEnabledFor(logger.VERBOSE) ?
  function verboseReturn(promise, method) {
    return promise.then(function(ret) {
      logger.verbose('proxied', { method: method, ret: ret });
      return ret;
    });
  } : function identity(x) {
    return x;
  };

function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver().then(function(driver) {
      logger.verbose('proxying', { method: method, args: args });
      return proxyReturn(driver[method].apply(driver, args), method);
    }).catch(function(err) {
      logger.error(method, err);
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

exports._initialClients = function() {
  return preClients().then(serviceClients);
};
