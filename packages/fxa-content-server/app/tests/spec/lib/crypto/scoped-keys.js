/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import ScopedKeys from 'lib/crypto/scoped-keys';

describe('lib/crypto/scoped-keys', () => {
  const keys = {
    kA: 'bba2ea983743324201a921e816f2e00e25da54473c9aa3ef050209c0f3bb8d86',
    kB: 'f5c47b97aecaf7dca9e020e4ea427f8431334a505cda40f09f3d9577e0006185',
  };
  const scope = 'https://identity.mozilla.com/apps/notes';
  const uid = 'aeaa1725c7a24ff983c6295725d5fc9b';
  const clientKeyData = {
    [scope]: {
      identifier: scope,
      keyRotationSecret:
        '0000000000000000000000000000000000000000000000000000000000000000',
      keyRotationTimestamp: 1510011454564,
    },
  };
  const derivedKey = {
    k: 'KjnhVUUT0du17z-EvFS1QrRtzzgGj3MfFIP0VwTX-FE',
    kid: '1510011455-DNaKHVok_W4xuqsgVxJ9Xw',
    kty: 'oct',
    scope: scope,
  };
  const clientScopedKey = {
    [scope]: derivedKey,
  };
  const keysJwk =
    'eyJrdHkiOiJFQyIsImtpZCI6IjVEakVLQ1ZSRGtCUFBLVTc4ZjNQOW92eU5EeDhnb1NWbGh0QzhFMlJfZXciLCJjcnYiOiJQLTI1NiIsIngiOiIzTXkwZzBNN3JwX2MyemMxNVlZM2xKcjlKcURrSmFXQjhLcTJ6aFhRTldNIiwieSI6IlVGZ05UVGVRbWlZTEE5VzJVTmIyemFaVHhzWHVtYnVpbDFhT0xlY1gxRk0ifQ'; //eslint-disable-line max-len

  describe('_deriveScopedKeys', () => {
    it('derives a key', () => {
      return ScopedKeys._deriveScopedKeys(
        keys.kB,
        uid,
        clientKeyData[scope]
      ).then((derivedObject) => {
        assert.deepEqual(derivedObject, derivedKey);
      });
    });

    it('throws if no inputKey', () => {
      return ScopedKeys._deriveScopedKeys().then(assert.fail, (err) => {
        assert.equal(err.message, 'input key is required');
      });
    });

    it('throws if no uid', () => {
      return ScopedKeys._deriveScopedKeys(keys.kB).then(assert.fail, (err) => {
        assert.equal(err.message, 'uid is required');
      });
    });

    it('throws if no client data', () => {
      return ScopedKeys._deriveScopedKeys(keys.kB, uid).then(
        assert.fail,
        (err) => {
          assert.equal(err.message, 'key data is required');
        }
      );
    });
  });

  describe('createEncryptedBundle', () => {
    let stringifySpy;

    beforeEach(() => {
      stringifySpy = sinon.spy(JSON, 'stringify');
    });

    afterEach(() => {
      stringifySpy.restore();
    });

    it('can encrypt keys', () => {
      return ScopedKeys.createEncryptedBundle(
        keys,
        uid,
        clientKeyData,
        keysJwk
      ).then((bundle) => {
        assert.match(
          bundle,
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );

        const jsonArgs = JSON.stringify.args[0];
        assert.deepEqual(jsonArgs, [clientScopedKey]);
      });
    });

    it('can encrypt with multiple keys', () => {
      const lockboxScope = 'https://identity.mozilla.com/apps/lockbox';
      const multiKeyData = Object.assign({}, clientKeyData);
      multiKeyData[lockboxScope] = {
        identifier: lockboxScope,
        keyRotationSecret:
          '0000000000000000000000000000000000000000000000000000000000000000',
        keyRotationTimestamp: 1510011454564,
      };

      const multiScopedKey = Object.assign({}, clientScopedKey);
      multiScopedKey[lockboxScope] = {
        k: 'SbUtOFV9kMetiDnnKSWxj4Q68OujHBBZoJ4iIRUEcc0',
        kid: '1510011455-3NkAzuGWSXoDVq2l8Lh6Kg',
        kty: 'oct',
        scope: 'https://identity.mozilla.com/apps/lockbox',
      };

      return ScopedKeys.createEncryptedBundle(
        keys,
        uid,
        multiKeyData,
        keysJwk
      ).then((bundle) => {
        const jsonArgs = JSON.stringify.args[0];
        assert.match(
          bundle,
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );
        assert.deepEqual(
          jsonArgs[0][lockboxScope],
          multiScopedKey[lockboxScope]
        );
        assert.deepEqual(jsonArgs[0][scope], multiScopedKey[scope]);
      });
    });

    it('can encrypt special-case legacy sync keys', () => {
      const syncScope = 'https://identity.mozilla.com/apps/oldsync';
      const multiKeyData = Object.assign({}, clientKeyData);
      multiKeyData[syncScope] = {
        identifier: syncScope,
        keyRotationSecret:
          '0000000000000000000000000000000000000000000000000000000000000000',
        keyRotationTimestamp: 1510011454564,
      };

      const multiScopedKey = Object.assign({}, clientScopedKey);
      multiScopedKey[syncScope] = {
        k:
          'qopE_9Q15dEy4L3EjabABj44sPueSnvHBsEfIHpb-75RpL6l5mCG570_LotVucBFZIXXVNQIisbT9J8KNLvJsA',
        kid: '1510011454564-xH5jmz0EO6TKxYXH_eK-9Q',
        kty: 'oct',
        scope: 'https://identity.mozilla.com/apps/oldsync',
      };

      return ScopedKeys.createEncryptedBundle(
        keys,
        uid,
        multiKeyData,
        keysJwk
      ).then((bundle) => {
        const jsonArgs = JSON.stringify.args[0];
        assert.match(
          bundle,
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );
        console.log(jsonArgs[0]);
        assert.deepEqual(jsonArgs[0][syncScope], multiScopedKey[syncScope]);
        assert.deepEqual(jsonArgs[0][scope], multiScopedKey[scope]);
      });
    });
  });
});
