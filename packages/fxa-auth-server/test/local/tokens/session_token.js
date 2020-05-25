/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const log = {
  trace() {},
  info() {},
  error: sinon.spy(),
};
const crypto = require('crypto');

const TOKEN = {
  createdAt: Date.now(),
  uid: 'xxx',
  email: Buffer.from('test@example.com').toString('hex'),
  emailCode: '123456',
  emailVerified: true,
  tokenVerificationId: crypto.randomBytes(16),
  verificationMethod: 2, // Totp verification method
  verifiedAt: Date.now(),
};

describe('SessionToken, tokenLifetimes.sessionTokenWithoutDevice > 0', () => {
  const MAX_AGE_WITHOUT_DEVICE = 1000 * 60 * 60 * 24 * 7 * 4;
  const config = {
    lastAccessTimeUpdates: {},
    tokenLifetimes: {
      sessionTokenWithoutDevice: MAX_AGE_WITHOUT_DEVICE,
    },
  };
  const tokens = require('../../../lib/tokens/index')(log, config);
  const SessionToken = tokens.SessionToken;

  it('interface is correct', () => {
    return SessionToken.create(TOKEN).then((token) => {
      assert.equal(
        typeof token.lastAuthAt,
        'function',
        'lastAuthAt method is defined'
      );
      assert.equal(
        typeof token.setUserAgentInfo,
        'function',
        'setUserAgentInfo method is defined'
      );
      assert.equal(
        typeof token.copyTokenState,
        'function',
        'copyTokenState method is defined'
      );
      assert.equal(
        Object.getOwnPropertyDescriptor(token, 'state'),
        undefined,
        'state property is undefined'
      );
      assert.equal(
        typeof Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(token),
          'state'
        ).get,
        'function',
        'state is a getter'
      );
      assert.notEqual(
        token.createdAt,
        TOKEN.createdAt,
        'createdAt values are completely ignored'
      );
    });
  });

  it('re-creation from tokenData works', () => {
    let token = null;
    return SessionToken.create(TOKEN)
      .then((x) => {
        token = x;
      })
      .then(() => {
        return SessionToken.fromHex(token.data, token);
      })
      .then((token2) => {
        assert.deepEqual(token.data, token2.data);
        assert.deepEqual(token.id, token2.id);
        assert.deepEqual(token.authKey, token2.authKey);
        assert.deepEqual(token.bundleKey, token2.bundleKey);
        assert.equal(typeof token.authKey, 'string');
        assert(Buffer.isBuffer(token.key));
        assert.equal(token.key.toString('hex'), token.authKey);
        assert.deepEqual(token.uid, token2.uid);
        assert.equal(token.email, token2.email);
        assert.equal(token.emailCode, token2.emailCode);
        assert.equal(token.emailVerified, token2.emailVerified);
        assert.equal(token.createdAt, token2.createdAt);
        assert.equal(token.tokenVerified, token2.tokenVerified);
        assert.equal(token.tokenVerificationId, token2.tokenVerificationId);
        assert.equal(token.state, token2.state);
        assert.equal(token.verificationMethod, token2.verificationMethod);
        assert.equal(token.verificationMethodValue, 'totp-2fa');
        assert.equal(token.verifiedAt, token2.verifiedAt);
        assert.deepEqual(
          token.authenticationMethods,
          token2.authenticationMethods
        );
        assert.deepEqual(
          token.authenticatorAssuranceLevel,
          token2.authenticatorAssuranceLevel
        );
      });
  });

  it('copy token state works', async () => {
    TOKEN.tokenVerificationCode = 'foo';
    TOKEN.tokenVerificationId = 'bar';
    const token = await SessionToken.create(TOKEN);
    const newState = await token.copyTokenState();
    assert.notEqual(token.tokenVerificationId, newState.tokenVerificationId);
    assert.notEqual(
      token.tokenVerificationCode,
      newState.tokenVerificationCode
    );
    assert.equal(token.data, newState.data);
    assert.equal(token.id, newState.id);
    assert.equal(token.uid, newState.uid);
    assert.equal(Object.keys(token).length, Object.keys(newState).length);
  });

  it('SessionToken.fromHex creates expired token if deviceId is null and createdAt is too old', () => {
    return SessionToken.create(TOKEN)
      .then((token) =>
        SessionToken.fromHex(token.data, {
          createdAt: Date.now() - MAX_AGE_WITHOUT_DEVICE - 1,
          deviceId: null,
        })
      )
      .then((token) => {
        assert.equal(token.ttl(), 0);
        assert.equal(token.expired(), true);
      });
  });

  it('SessionToken.fromHex creates non-expired token if deviceId is null and createdAt is recent enough', () => {
    return SessionToken.create(TOKEN)
      .then((token) =>
        SessionToken.fromHex(token.data, {
          createdAt: Date.now() - MAX_AGE_WITHOUT_DEVICE + 10000,
          deviceId: null,
        })
      )
      .then((token) => {
        assert.equal(token.ttl() > 0, true);
        assert.equal(token.expired(), false);
      });
  });

  it('SessionToken.fromHex creates non-expired token if deviceId is set and createdAt is too old', () => {
    return SessionToken.create(TOKEN)
      .then((token) =>
        SessionToken.fromHex(token.data, {
          createdAt: Date.now() - MAX_AGE_WITHOUT_DEVICE - 1,
          deviceId: crypto.randomBytes(16),
        })
      )
      .then((token) => {
        assert.equal(token.ttl() > 0, true);
        assert.equal(token.expired(), false);
      });
  });

  it('create with NaN createdAt', () => {
    return SessionToken.create({
      createdAt: NaN,
      email: 'foo',
      uid: 'bar',
    }).then((token) => {
      const now = Date.now();
      assert.ok(token.createdAt > now - 1000 && token.createdAt <= now);
    });
  });

  it('sessionToken key derivations are test-vector compliant', () => {
    let token = null;
    const tokenData =
      'a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf';
    return SessionToken.fromHex(tokenData, TOKEN).then((x) => {
      token = x;
      assert.equal(token.data.toString('hex'), tokenData);
      assert.equal(
        token.id,
        'c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab'
      );
      assert.equal(
        token.authKey.toString('hex'),
        '9d8f22998ee7f5798b887042466b72d53e56ab0c094388bf65831f702d2febc0'
      );
    });
  });

  it('SessionToken.setUserAgentInfo', () => {
    return SessionToken.create(TOKEN).then((token) => {
      token.setUserAgentInfo({
        data: 'foo',
        id: 'foo',
        authKey: 'foo',
        bundleKey: 'foo',
        algorithm: 'foo',
        uid: 'foo',
        lifetime: 'foo',
        createdAt: 'foo',
        email: 'foo',
        emailCode: 'foo',
        emailVerified: 'foo',
        verifierSetAt: 'foo',
        locale: 'foo',
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaDeviceType: 'wibble',
        uaFormFactor: 'blee',
        lastAccessTime: 'mnngh',
      });
      assert.notEqual(token.data, 'foo', 'data was not updated');
      assert.notEqual(token.id, 'foo', 'id was not updated');
      assert.notEqual(token.authKey, 'foo', 'authKey was not updated');
      assert.notEqual(token.bundleKey, 'foo', 'bundleKey was not updated');
      assert.notEqual(token.algorithm, 'foo', 'algorithm was not updated');
      assert.notEqual(token.uid, 'foo', 'uid was not updated');
      assert.notEqual(token.lifetime, 'foo', 'lifetime was not updated');
      assert.notEqual(token.createdAt, 'foo', 'createdAt was not updated');
      assert.notEqual(token.email, 'foo', 'email was not updated');
      assert.notEqual(
        token.emailVerified,
        'foo',
        'emailVerified was not updated'
      );
      assert.notEqual(
        token.verifierSetAt,
        'foo',
        'verifierSetAt was not updated'
      );
      assert.notEqual(token.locale, 'foo', 'locale was not updated');
      assert.equal(token.uaBrowser, 'foo', 'uaBrowser was updated');
      assert.equal(
        token.uaBrowserVersion,
        'bar',
        'uaBrowserVersion was updated'
      );
      assert.equal(token.uaOS, 'baz', 'uaOS was updated');
      assert.equal(token.uaOSVersion, 'qux', 'uaOSVersion was updated');
      assert.equal(token.uaDeviceType, 'wibble', 'uaDeviceType was updated');
      assert.equal(token.uaFormFactor, 'blee', 'uaFormFactor was updated');
      assert.equal(token.lastAccessTime, 'mnngh', 'lastAccessTime was updated');
    });
  });

  it('SessionToken.setUserAgentInfo without lastAccessTime', () => {
    return SessionToken.create(TOKEN).then((token) => {
      token.lastAccessTime = 'foo';
      token.setUserAgentInfo({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaDeviceType: 'wibble',
        uaFormFactor: 'blee',
      });
      assert.notEqual(
        token.lastAccessTime,
        undefined,
        'lastAccessTime was not clobbered'
      );
    });
  });

  describe('state', () => {
    it('should be unverified if token is not verified', () => {
      const token = new SessionToken({}, {});
      token.tokenVerified = false;
      assert.equal(token.state, 'unverified');
    });

    it('should be verified if token is verified', () => {
      const token = new SessionToken({}, {});
      token.tokenVerified = true;
      assert.equal(token.state, 'verified');
    });
  });

  describe('authenticationMethods', () => {
    it('should be [`pwd`] for unverified tokens', () => {
      return SessionToken.create(
        Object.assign({}, TOKEN, {
          verificationMethod: null,
          verifiedAt: null,
        })
      ).then((token) => {
        assert.deepEqual(Array.from(token.authenticationMethods).sort(), [
          'pwd',
        ]);
      });
    });

    it('should be [`pwd`, `email`] for verified tokens', () => {
      return SessionToken.create(
        Object.assign({}, TOKEN, {
          tokenVerificationId: null,
          verificationMethod: null,
          verifiedAt: null,
        })
      ).then((token) => {
        assert.deepEqual(Array.from(token.authenticationMethods).sort(), [
          'email',
          'pwd',
        ]);
      });
    });

    it('should be [`pwd`, `email`] for tokens verified via email-2fa', () => {
      return SessionToken.create(
        Object.assign({}, TOKEN, {
          tokenVerificationId: null,
          verificationMethod: 1,
        })
      ).then((token) => {
        assert.deepEqual(Array.from(token.authenticationMethods).sort(), [
          'email',
          'pwd',
        ]);
      });
    });

    it('should be [`pwd`, `otp`] for tokens verified via totp-2fa', () => {
      return SessionToken.create(
        Object.assign({}, TOKEN, {
          verificationMethod: 2,
        })
      ).then((token) => {
        assert.deepEqual(Array.from(token.authenticationMethods).sort(), [
          'otp',
          'pwd',
        ]);
      });
    });
  });
});

describe('SessionToken, tokenLifetimes.sessionTokenWithoutDevice === 0', () => {
  const config = {
    lastAccessTimeUpdates: {},
    tokenLifetimes: {
      sessionTokenWithoutDevice: 0,
    },
  };
  const tokens = require('../../../lib/tokens/index')(log, config);
  const SessionToken = tokens.SessionToken;

  it('SessionToken.fromHex creates non-expired token if deviceId is null and createdAt is too old', () => {
    return SessionToken.create(TOKEN)
      .then((token) =>
        SessionToken.fromHex(token.data, {
          createdAt: 1,
          deviceId: null,
        })
      )
      .then((token) => {
        assert.equal(token.ttl() > 0, true);
        assert.equal(token.expired(), false);
      });
  });
});
