/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable sorting/sort-object-props */

'use strict';

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!bluebird',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon'
], (registerSuite, assert, P, path, proxyquire, sinon) => {
  const config = {
    enabled: true
  };
  const results = {
    geodb: P.resolve('mock geodb result'),
    remoteAddress: { clientAddress: 'mock remoteAddress result' }
  };
  const geodb = sinon.spy(() => P.resolve(results.geodb));
  const logger = {
    error: sinon.spy()
  };
  const remoteAddress = sinon.spy(() => results.remoteAddress);
  const geolocate = proxyquire(path.resolve('server/lib/geo-locate'), {
    './configuration': {
      get (key) {
        if (key === 'geodb') {
          return config;
        }
      }
    },
    'fxa-geodb': c => {
      if (c === config) {
        return geodb;
      }
    },
    './logging/log': () => logger,
    './remote-address': remoteAddress
  });

  registerSuite({
    name: 'geo-locate',

    afterEach () {
      geodb.reset();
      logger.error.reset();
      remoteAddress.reset();
    },

    'interface is correct': () => {
      assert.isFunction(geolocate);
      assert.lengthOf(geolocate, 1);
    },

    'behaves correctly if geodb succeeds': () => {
      return geolocate('blee')
        .then(result => {
          assert.equal(result, 'mock geodb result');

          assert.equal(remoteAddress.callCount, 1);
          let args = remoteAddress.args[0];
          assert.equal(args.length, 1);
          assert.equal(args[0], 'blee');

          assert.equal(geodb.callCount, 1);
          args = geodb.args[0];
          assert.equal(args.length, 1);
          assert.equal(args[0], 'mock remoteAddress result');

          assert.equal(logger.error.callCount, 0);
        });
    },

    'behaves correctly if geodb fails': () => {
      results.geodb = P.reject('ohno');
      return geolocate('fuffle')
        .then(result => {
          assert.deepEqual(result, {});

          assert.equal(remoteAddress.callCount, 1);
          assert.equal(geodb.callCount, 1);

          assert.equal(logger.error.callCount, 1);
          const args = logger.error.args[0];
          assert.equal(args.length, 2);
          assert.equal(args[0], 'geodb.error');
          assert.equal(args[1], 'ohno');
        });
    },

    'behaves correctly if config is disabled': () => {
      config.enabled = false;
      return geolocate('blee')
        .then(result => {
          assert.deepEqual(result, {});

          assert.equal(remoteAddress.callCount, 0);
          assert.equal(geodb.callCount, 0);
          assert.equal(logger.error.callCount, 0);
        });
    }
  });
});

