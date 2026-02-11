/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as jose from 'node-jose';

import { DeriverUtils } from '../deriver/deriver-utils';
import { KeyUtils } from './key-utils';

describe('KeyUtils', function () {
  describe('createApplicationKeyPair', () => {
    it('should output a JWK public key', () => {
      const keyUtils = new KeyUtils();

      return keyUtils.createApplicationKeyPair().then((result) => {
        const jwk = result.jwkPublicKey;
        expect(jwk.kty).toBe('EC');
        expect(jwk.kid.length).toBe(43);
        expect(jwk.crv).toBe('P-256');
        expect(jwk.x.length).toBe(43);
        expect(jwk.y.length).toBe(43);
      });
    });
  });

  describe('decryptBundle', () => {
    it('fails with no key store', async () => {
      const keyUtils = new KeyUtils();

      return expect(keyUtils.decryptBundle('bundle')).rejects.toThrowError(
        'No Key Store. Use .createApplicationKeyPair() to create it first.'
      );
    });

    it('can decrypt a bundle', async () => {
      const derivedKeys = {
        'https://identity.mozilla.com/apps/notes': {
          kid: '<opaque key identifier>',
          k: '<notes encryption key, b64url-encoded>',
          kty: 'oct',
        },
      };
      const keyUtils = new KeyUtils();
      const deriverUtils = new DeriverUtils();

      const keys = await keyUtils.createApplicationKeyPair();
      const base64JwkPublicKey = jose.util.base64url.encode(
        JSON.stringify(keys.jwkPublicKey),
        'utf8'
      );
      const encryptedBundle = await deriverUtils.encryptBundle(
        base64JwkPublicKey,
        JSON.stringify(derivedKeys)
      );
      const decryptedBundle = await keyUtils.decryptBundle(encryptedBundle);
      expect(decryptedBundle).toEqual(derivedKeys);
    });

    it('can decrypt a test vector key bundle generated via python code', async () => {
      const keyUtils = new KeyUtils();
      keyUtils.keystore = jose.JWK.createKeyStore();
      await keyUtils.keystore.add({
        kty: 'EC',
        crv: 'P-256',
        d: 'KXAjjEr4KT9UlYI4BE0BefVdoxP8vqO389U7lQlCigs',
        x: 'SiBn6uebjigmQqw4TpNzs3AUyCae1_sG2b9Fzhq3Fyo',
        y: 'q99Xq1RWNTFpk99pdQOSjUvwELss51PkmAGCXhLfMV4',
      });

      const result = await keyUtils.decryptBundle(
        'eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImVwayI6eyJjcnYiOiJQLTI1NiIsImt0eSI6IkVDIiwieCI6Ik40elBSYXpCODd2cGVCZ0h6RnZrdmRfNDhvd0ZZWXhFVlhSTXJPVTZMRG8iLCJ5IjoiNG5jVXhONnhfeFQxVDFrenlfU19WMmZZWjd1VUpUX0hWUk5aQkxKUnN4VSJ9fQ.._0sYf7HdWuRv2cM0.U5ZK5BYZWhLluS7q4y4ZFW1UwcW-s7mjuY_khe4OVjtvLE5jOQw-qGyT_06wY2zpqN6FhGMa16Qhn4UABz0LuDwAfrHOtfRlpqeV3nrKhas2gXt1yLvDFLide4hEPfBJk60t2CXjxprsA1BulinIER2EIJbA.rpf5rzO78Hj-9CWRTLx7TQ'
      );

      expect(result).toEqual({
        app_key: {
          k: 'rTcZ5olrrJWqVD6bVtLjHJT0P6d_9IdpEgWT4zVzMb0',
          kid: '1510726317-UvyHCg_RD3zKl_hQdlRsfw',
          kty: 'oct',
        },
      });
    });
  });
});
