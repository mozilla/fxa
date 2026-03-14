/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const keys = require('../../oauth/keys');

describe('/jwks GET', () => {
  describe('config handling', () => {
    it('returns the configured public keys', async () => {
      const PUBLIC_KEYS = [
        keys.extractPublicKey(keys.generatePrivateKey()),
        keys.extractPublicKey(keys.generatePrivateKey()),
      ];

      jest.resetModules();
      jest.doMock('../../oauth/keys', () => ({
        ...keys,
        PUBLIC_KEYS,
      }));
      const route = require('./jwks')();

      const resp = await route.config.handler();
      expect(Object.keys(resp)).toEqual(['keys']);
      expect(resp.keys).toEqual(PUBLIC_KEYS);
    });
  });
});
