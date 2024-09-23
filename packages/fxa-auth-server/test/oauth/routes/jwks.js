/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import proxyquire from 'proxyquire';
import mocks from '../../lib/mocks';
import keys from '../../../lib/oauth/keys';

const routeModulePath = '../../../lib/routes/oauth/jwks';
var dependencies = mocks.require(
  [{ path: '../../oauth/keys' }],
  routeModulePath,
  __dirname
);

describe('/jwks GET', function () {
  describe('config handling', () => {
    let PUBLIC_KEYS, getRoute;

    beforeEach(() => {
      PUBLIC_KEYS = [];
      getRoute = () => {
        dependencies['../../oauth/keys'].PUBLIC_KEYS = PUBLIC_KEYS;
        return proxyquire(routeModulePath, dependencies)();
      };
    });

    it('returns the configured public keys', async () => {
      PUBLIC_KEYS = [
        keys.extractPublicKey(keys.generatePrivateKey()),
        keys.extractPublicKey(keys.generatePrivateKey()),
      ];
      const resp = await getRoute().config.handler();
      assert.deepEqual(Object.keys(resp), ['keys']);
      assert.deepEqual(resp.keys[0], PUBLIC_KEYS[0]);
      assert.deepEqual(resp.keys[1], PUBLIC_KEYS[1]);
    });
  });
});
