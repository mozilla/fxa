/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const mocks = require('../lib/mocks');
const keys = require('../../lib/keys');

const routeModulePath = '../../lib/routes/jwks';
var dependencies = mocks.require(
  [{ path: '../keys' }],
  routeModulePath,
  __dirname
);

describe('/jwks GET', function() {
  describe('config handling', () => {
    let PUBLIC_KEYS, getRoute;

    beforeEach(() => {
      PUBLIC_KEYS = [];
      getRoute = () => {
        dependencies['../keys'].PUBLIC_KEYS = PUBLIC_KEYS;
        return proxyquire(routeModulePath, dependencies);
      };
    });

    it('returns the configured public keys', async () => {
      PUBLIC_KEYS = [
        keys.extractPublicKey(keys.generatePrivateKey()),
        keys.extractPublicKey(keys.generatePrivateKey()),
      ];
      const resp = await getRoute().handler();
      assert.deepEqual(Object.keys(resp), ['keys']);
      assert.deepEqual(resp.keys[0], PUBLIC_KEYS[0]);
      assert.deepEqual(resp.keys[1], PUBLIC_KEYS[1]);
    });
  });
});
