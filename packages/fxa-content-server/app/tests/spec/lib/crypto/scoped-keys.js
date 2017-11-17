/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const sinon = require('sinon');
  const ScopedKeys = require('lib/crypto/scoped-keys');

  describe('lib/crypto/scoped-keys', () => {
    const keys = {
      kA: 'bba2ea983743324201a921e816f2e00e25da54473c9aa3ef050209c0f3bb8d86',
      kB: 'f5c47b97aecaf7dca9e020e4ea427f8431334a505cda40f09f3d9577e0006185'
    };
    const scope = 'https://identity.mozilla.org/apps/notes';
    const clientKeyData = {
      [scope]: {
        identifier: scope,
        keyRotationSecret: '0000000000000000000000000000000000000000000000000000000000000000',
        keyRotationTimestamp: 1510011454564
      }
    };
    const derivedKey = {
      k: '6pXqtKRy9VJ2aXc9cQsNjdB1058MMEOtfSmYL8TFTgo',
      kid: '1510011455-A19NCXeloCwS_-QqRdgqMQ',
      kty: 'oct',
      scope: scope
    };
    const clientScopedKey = {
      [scope]: derivedKey
    };
    const keysJwk = 'eyJrdHkiOiJFQyIsImtpZCI6IjVEakVLQ1ZSRGtCUFBLVTc4ZjNQOW92eU5EeDhnb1NWbGh0QzhFMlJfZXciLCJjcnYiOiJQLTI1NiIsIngiOiIzTXkwZzBNN3JwX2MyemMxNVlZM2xKcjlKcURrSmFXQjhLcTJ6aFhRTldNIiwieSI6IlVGZ05UVGVRbWlZTEE5VzJVTmIyemFaVHhzWHVtYnVpbDFhT0xlY1gxRk0ifQ'; //eslint-disable-line max-len

    describe('_deriveScopedKeys', () => {
      it('derives a key', () => {
        return ScopedKeys._deriveScopedKeys(keys.kB, clientKeyData[scope]).then((derivedObject) => {
          assert.deepEqual(derivedObject, derivedKey);
        });
      });

      it('throws if no inputKey', () => {
        return ScopedKeys._deriveScopedKeys().then(assert.fail, (err) => {
          assert.equal(err.message, 'Missing input key');
        });
      });

      it('throws if no client data', () => {
        return ScopedKeys._deriveScopedKeys(keys.kB).then(assert.fail, (err) => {
          assert.equal(err.message, 'Missing key data');
        });
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
        return ScopedKeys.createEncryptedBundle(keys, clientKeyData, keysJwk).then((bundle) => {
          assert.match(bundle, /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);

          const jsonArgs = JSON.stringify.args[0];
          assert.deepEqual(jsonArgs, [clientScopedKey]);
        });
      });

      it('can encrypt with multiple keys', () => {
        const lockboxScope = 'https://identity.mozilla.org/apps/lockbox';
        const multiKeyData = Object.assign({}, clientKeyData);
        multiKeyData[lockboxScope] = {
          identifier: lockboxScope,
          keyRotationSecret: '0000000000000000000000000000000000000000000000000000000000000000',
          keyRotationTimestamp: 1510011454564
        };

        const multiScopedKey = Object.assign({}, clientScopedKey);
        multiScopedKey[lockboxScope] = {
          k: 'wQtdTZjQO4VmxBLS_FvR16btBtEoUH76Ao4I_Upiszk',
          kid: '1510011455-6AWjg8ZvOENFpRDXSF3zKQ',
          kty: 'oct',
          scope: 'https://identity.mozilla.org/apps/lockbox'
        };

        return ScopedKeys.createEncryptedBundle(keys, multiKeyData, keysJwk).then((bundle) => {
          const jsonArgs = JSON.stringify.args[0];

          assert.match(bundle, /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
          assert.deepEqual(jsonArgs[0][lockboxScope], multiScopedKey[lockboxScope]);
          assert.deepEqual(jsonArgs[0][scope], multiScopedKey[scope]);
        });
      });
    });

  });
});
