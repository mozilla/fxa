/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

import sinon from 'sinon';

const crypto = require('crypto');
const log = {
  trace() {},
  info() {},
  error: sinon.spy(),
};

interface SessionTokenLike {
  data: Buffer;
  id: string;
  authKey: string;
  bundleKey: string | Buffer;
  uid: string;
  key: Buffer;
  algorithm: string;
  lifetime: number;
  createdAt: number;
  email: string;
  emailCode: string;
  emailVerified: boolean;
  verifierSetAt: number;
  locale: string;
  tokenVerified: boolean;
  tokenVerificationId: string | null;
  state: string;
  verificationMethod: number | null;
  verificationMethodValue: string | null;
  verifiedAt: number | null;
  authenticationMethods: Set<string>;
  authenticatorAssuranceLevel: number;
  uaBrowser: string;
  uaBrowserVersion: string;
  uaOS: string;
  uaOSVersion: string;
  uaDeviceType: string;
  uaFormFactor: string;
  lastAccessTime: string | number;
  lastAuthAt(): number;
  setUserAgentInfo(info: Record<string, string>): void;
  copyTokenState(): Promise<SessionTokenLike>;
  ttl(asOf?: number): number;
  expired(asOf?: number): boolean;
}

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
  const tokens = require('./index')(log, config);
  const SessionToken = tokens.SessionToken;

  it('interface is correct', async () => {
    const token: SessionTokenLike = await SessionToken.create(TOKEN);
    expect(typeof token.lastAuthAt).toBe('function');
    expect(typeof token.setUserAgentInfo).toBe('function');
    expect(typeof token.copyTokenState).toBe('function');
    expect(
      Object.getOwnPropertyDescriptor(token, 'state')
    ).toBeUndefined();
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(token),
      'state'
    );
    expect(descriptor).toBeDefined();
    expect(typeof descriptor?.get).toBe('function');
    expect(token.createdAt).not.toBe(TOKEN.createdAt);
  });

  it('re-creation from tokenData works', async () => {
    const token: SessionTokenLike = await SessionToken.create(TOKEN);
    const token2: SessionTokenLike = await SessionToken.fromHex(token.data, token);
    expect(token.data).toEqual(token2.data);
    expect(token.id).toEqual(token2.id);
    expect(token.authKey).toEqual(token2.authKey);
    expect(token.bundleKey).toEqual(token2.bundleKey);
    expect(typeof token.authKey).toBe('string');
    expect(Buffer.isBuffer(token.key)).toBe(true);
    expect(token.key.toString('hex')).toBe(token.authKey);
    expect(token.uid).toEqual(token2.uid);
    expect(token.email).toBe(token2.email);
    expect(token.emailCode).toBe(token2.emailCode);
    expect(token.emailVerified).toBe(token2.emailVerified);
    expect(token.createdAt).toBe(token2.createdAt);
    expect(token.tokenVerified).toBe(token2.tokenVerified);
    expect(token.tokenVerificationId).toBe(token2.tokenVerificationId);
    expect(token.state).toBe(token2.state);
    expect(token.verificationMethod).toBe(token2.verificationMethod);
    expect(token.verificationMethodValue).toBe('totp-2fa');
    expect(token.verifiedAt).toBe(token2.verifiedAt);
    expect(token.authenticationMethods).toEqual(
      token2.authenticationMethods
    );
    expect(token.authenticatorAssuranceLevel).toEqual(
      token2.authenticatorAssuranceLevel
    );
  });

  it('copy token state works', async () => {
    (TOKEN as Record<string, unknown>).tokenVerificationId = 'bar';
    const token: SessionTokenLike = await SessionToken.create(TOKEN);
    const newState = await token.copyTokenState();
    expect(token.tokenVerificationId).not.toBe(newState.tokenVerificationId);
    expect(token.data).toBe(newState.data);
    expect(token.id).toBe(newState.id);
    expect(token.uid).toBe(newState.uid);
    expect(Object.keys(token).length).toBe(Object.keys(newState).length);
  });

  it('SessionToken.fromHex creates expired token if deviceId is null and createdAt is too old', async () => {
    const created: SessionTokenLike = await SessionToken.create(TOKEN);
    const token: SessionTokenLike = await SessionToken.fromHex(created.data, {
      createdAt: Date.now() - MAX_AGE_WITHOUT_DEVICE - 1,
      deviceId: null,
    });
    expect(token.ttl()).toBe(0);
    expect(token.expired()).toBe(true);
  });

  it('SessionToken.fromHex creates non-expired token if deviceId is null and createdAt is recent enough', async () => {
    const created: SessionTokenLike = await SessionToken.create(TOKEN);
    const token: SessionTokenLike = await SessionToken.fromHex(created.data, {
      createdAt: Date.now() - MAX_AGE_WITHOUT_DEVICE + 10000,
      deviceId: null,
    });
    expect(token.ttl() > 0).toBe(true);
    expect(token.expired()).toBe(false);
  });

  it('SessionToken.fromHex creates non-expired token if deviceId is set and createdAt is too old', async () => {
    const created: SessionTokenLike = await SessionToken.create(TOKEN);
    const token: SessionTokenLike = await SessionToken.fromHex(created.data, {
      createdAt: Date.now() - MAX_AGE_WITHOUT_DEVICE - 1,
      deviceId: crypto.randomBytes(16),
    });
    expect(token.ttl() > 0).toBe(true);
    expect(token.expired()).toBe(false);
  });

  it('create with NaN createdAt', async () => {
    const token: SessionTokenLike = await SessionToken.create({
      createdAt: NaN,
      email: 'foo',
      uid: 'bar',
    });
    const now = Date.now();
    expect(token.createdAt > now - 1000 && token.createdAt <= now).toBeTruthy();
  });

  it('sessionToken key derivations are test-vector compliant', async () => {
    const tokenData =
      'a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf';
    const token: SessionTokenLike = await SessionToken.fromHex(tokenData, TOKEN);
    expect(token.data.toString('hex')).toBe(tokenData);
    expect(token.id).toBe(
      'c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab'
    );
    expect(token.authKey).toBe(
      '9d8f22998ee7f5798b887042466b72d53e56ab0c094388bf65831f702d2febc0'
    );
  });

  it('SessionToken.setUserAgentInfo', async () => {
    const token: SessionTokenLike = await SessionToken.create(TOKEN);
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
    expect(token.data).not.toBe('foo');
    expect(token.id).not.toBe('foo');
    expect(token.authKey).not.toBe('foo');
    expect(token.bundleKey).not.toBe('foo');
    expect(token.algorithm).not.toBe('foo');
    expect(token.uid).not.toBe('foo');
    expect(token.lifetime).not.toBe('foo');
    expect(token.createdAt).not.toBe('foo');
    expect(token.email).not.toBe('foo');
    expect(token.emailVerified).not.toBe('foo');
    expect(token.verifierSetAt).not.toBe('foo');
    expect(token.locale).not.toBe('foo');
    expect(token.uaBrowser).toBe('foo');
    expect(token.uaBrowserVersion).toBe('bar');
    expect(token.uaOS).toBe('baz');
    expect(token.uaOSVersion).toBe('qux');
    expect(token.uaDeviceType).toBe('wibble');
    expect(token.uaFormFactor).toBe('blee');
    expect(token.lastAccessTime).toBe('mnngh');
  });

  it('SessionToken.setUserAgentInfo without lastAccessTime', async () => {
    const token: SessionTokenLike = await SessionToken.create(TOKEN);
    token.lastAccessTime = 'foo';
    token.setUserAgentInfo({
      uaBrowser: 'foo',
      uaBrowserVersion: 'bar',
      uaOS: 'baz',
      uaOSVersion: 'qux',
      uaDeviceType: 'wibble',
      uaFormFactor: 'blee',
    });
    expect(token.lastAccessTime).not.toBeUndefined();
  });

  describe('state', () => {
    it('should be unverified if token is not verified', () => {
      const token = new SessionToken({}, {});
      token.tokenVerified = false;
      expect(token.state).toBe('unverified');
    });

    it('should be verified if token is verified', () => {
      const token = new SessionToken({}, {});
      token.tokenVerified = true;
      expect(token.state).toBe('verified');
    });
  });

  describe('authenticationMethods', () => {
    it('should be [`pwd`] for unverified tokens', async () => {
      const token: SessionTokenLike = await SessionToken.create({
        ...TOKEN,
        verificationMethod: null,
        verifiedAt: null,
      });
      expect(Array.from(token.authenticationMethods).sort()).toEqual([
        'pwd',
      ]);
    });

    it('should be [`pwd`, `email`] for verified tokens', async () => {
      const token: SessionTokenLike = await SessionToken.create({
        ...TOKEN,
        tokenVerificationId: null,
        verificationMethod: null,
        verifiedAt: null,
      });
      expect(Array.from(token.authenticationMethods).sort()).toEqual([
        'email',
        'pwd',
      ]);
    });

    it('should be [`pwd`, `email`] for tokens verified via email-2fa', async () => {
      const token: SessionTokenLike = await SessionToken.create({
        ...TOKEN,
        tokenVerificationId: null,
        verificationMethod: 1,
      });
      expect(Array.from(token.authenticationMethods).sort()).toEqual([
        'email',
        'pwd',
      ]);
    });

    it('should be [`pwd`, `otp`] for tokens verified via totp-2fa', async () => {
      const token: SessionTokenLike = await SessionToken.create({
        ...TOKEN,
        verificationMethod: 2,
      });
      expect(Array.from(token.authenticationMethods).sort()).toEqual([
        'otp',
        'pwd',
      ]);
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
  const tokens = require('./index')(log, config);
  const SessionToken = tokens.SessionToken;

  it('SessionToken.fromHex creates non-expired token if deviceId is null and createdAt is too old', async () => {
    const created: SessionTokenLike = await SessionToken.create(TOKEN);
    const token: SessionTokenLike = await SessionToken.fromHex(created.data, {
      createdAt: 1,
      deviceId: null,
    });
    expect(token.ttl() > 0).toBe(true);
    expect(token.expired()).toBe(false);
  });
});
