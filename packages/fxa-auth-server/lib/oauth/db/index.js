/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const unbuf = require('buf').unbuf.hex;

const P = require('../../promise');

const config = require('../../../config');
const encrypt = require('../encrypt');
const logger = require('../logging')('db');
const mysql = require('./mysql');

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
        dbProp: dbProp,
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
  var clients = config.get('oauthServer.clients');
  if (clients && clients.length) {
    logger.debug('predefined.loading', { clients: clients });
    return P.all(
      clients.map(function(c) {
        if (c.secret) {
          // eslint-disable-next-line no-console
          console.error(
            'Do not keep client secrets in the config file.' + // eslint-disable-line no-console
              ' Use the `hashedSecret` field instead.\n\n' +
              '\tclient=%s has `secret` field\n' +
              '\tuse hashedSecret="%s" instead',
            c.id,
            unbuf(encrypt.hash(c.secret))
          );
          return P.reject(
            new Error('Do not keep client secrets in the config file.')
          );
        }

        // ensure the required keys are present.
        var err = null;
        var REQUIRED_CLIENTS_KEYS = [
          'id',
          'hashedSecret',
          'name',
          'imageUri',
          'redirectUri',
          'trusted',
          'canGrant',
        ];
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
        c.publicClient = !!c.publicClient;

        // Modification of the database at startup in production and stage is
        // not preferred. This option will be set to false on those stacks.
        if (!config.get('oauthServer.db.autoUpdateClients')) {
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
                after: c,
              });
              return exports.updateClient(c);
            }
          } else {
            return exports.registerClient(c);
          }
        });
      })
    );
  } else {
    return P.resolve();
  }
}

/**
 * Insert pre-defined list of scopes into the DB
 */
function scopes() {
  var scopes = config.get('oauthServer.scopes');
  if (scopes && scopes.length) {
    logger.debug('scopes.loading', JSON.stringify(scopes));

    return P.all(
      scopes.map(function(s) {
        return exports.getScope(s.scope).then(function(existing) {
          if (existing) {
            logger.verbose('scopes.existing', s);
            return;
          }

          return exports.registerScope(s);
        });
      })
    );
  }
}

var driver;
function withDriver() {
  if (driver) {
    return P.resolve(driver);
  }
  const p = mysql.connect(config.get('oauthServer.mysql'));

  return p
    .then(function(store) {
      logger.debug('connected', {
        driver: 'mysql',
      });
      driver = store;
    })
    .then(exports._initialClients)
    .then(function() {
      return driver;
    });
}

const proxyReturn = logger.isEnabledFor(logger.VERBOSE)
  ? function verboseReturn(promise, method) {
    return promise.then(function(ret) {
      logger.verbose('proxied', { method: method, ret: ret });
      return ret;
    });
  }
  : function identity(x) {
    return x;
  };

function proxy(method) {
  return function proxied() {
    var args = arguments;
    return withDriver()
      .then(function(driver) {
        logger.verbose('proxying', { method: method, args: args });
        return proxyReturn(driver[method].apply(driver, args), method);
      })
      .catch(function(err) {
        logger.error(method, err);
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
  return preClients().then(scopes);
};
