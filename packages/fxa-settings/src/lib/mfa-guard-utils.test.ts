/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { JwtTokenCache, MfaOtpRequestCache } from './cache';
import { bytesToBase64url } from './base64url';
import {
  clearMfaAndJwtCacheOnInvalidJwt,
  isInvalidJwtError,
  uidFromMfaToken,
} from './mfa-guard-utils';

const defaultSessionToken = 'you-get-a-session-token';
const jwt = 'and-you-get-a-jwt';
const scope = 'test';

jest.mock('./cache', () => {
  const actual = jest.requireActual('./cache');
  return {
    __esModule: true,
    ...actual,
    sessionToken: jest.fn(() => defaultSessionToken),
  };
});

describe('mfa-guard-utils', () => {
  let sessionTokenSpy: jest.SpyInstance;

  beforeEach(() => {
    sessionTokenSpy = jest.mocked(require('./cache').sessionToken);
  });

  afterEach(() => {
    sessionTokenSpy.mockReturnValue(defaultSessionToken);
  });

  describe('isInvalidJwtError', () => {
    it('should return true for an invalid MFA token error (errno 223)', () => {
      expect(isInvalidJwtError({ code: 401, errno: 223 })).toBe(true);
    });

    it('should return true for a generic invalid token error (errno 110)', () => {
      // The MFA strategy resolves a JWT's parent session (stid) via
      // db.sessionToken, which throws errno 110 when that session is gone.
      expect(isInvalidJwtError({ code: 401, errno: 110 })).toBe(true);
    });

    it('should return false if the error is not an invalid JWT error', () => {
      expect(isInvalidJwtError({ code: 401, errno: 100 })).toBe(false);
    });

    it('should return false if the error is not an object', () => {
      expect(isInvalidJwtError('not-an-object')).toBe(false);
    });

    it('should return false if the error is not an object with code and errno properties', () => {
      expect(isInvalidJwtError({ code: 401 })).toBe(false);
    });
  });

  describe('clearMfaAndJwtCacheOnInvalidJwt', () => {
    let removeJwtSpy: jest.SpyInstance;
    let removeOtpSpy: jest.SpyInstance;

    beforeEach(() => {
      removeJwtSpy = jest.spyOn(JwtTokenCache, 'removeToken');
      removeOtpSpy = jest.spyOn(MfaOtpRequestCache, 'remove');
    });

    afterEach(() => {
      removeJwtSpy.mockReset();
      removeOtpSpy.mockReset();
    });

    it('should clear the MFA and JWT cache if the error is an invalid JWT error', () => {
      const e = { code: 401, errno: 223 };

      clearMfaAndJwtCacheOnInvalidJwt(e, scope);

      expect(removeOtpSpy).toHaveBeenCalledWith(defaultSessionToken, scope);
      expect(removeJwtSpy).toHaveBeenCalledWith(defaultSessionToken, scope);
    });

    it('should not clear the MFA and JWT cache if the error is not an invalid JWT error', () => {
      MfaOtpRequestCache.set(defaultSessionToken, scope);
      JwtTokenCache.setToken(defaultSessionToken, scope, jwt);
      const e = { code: 401, errno: 100 };

      clearMfaAndJwtCacheOnInvalidJwt(e, scope);

      expect(MfaOtpRequestCache.get(defaultSessionToken, scope)).toBeDefined();
      expect(JwtTokenCache.getToken(defaultSessionToken, scope)).toBeDefined();
    });

    it('should not clear the MFA and JWT cache if the session token is not set', () => {
      MfaOtpRequestCache.set(defaultSessionToken, scope);
      JwtTokenCache.setToken(defaultSessionToken, scope, jwt);

      // Override sessionToken to return undefined
      sessionTokenSpy.mockReturnValue(undefined);

      const e = { code: 401, errno: 223 };

      const cleared = clearMfaAndJwtCacheOnInvalidJwt(e, scope);
      expect(cleared).toBe(false);

      expect(removeOtpSpy).not.toHaveBeenCalled();
      expect(removeJwtSpy).not.toHaveBeenCalled();
    });

    it('should not clear the MFA and JWT cache if the session token is null', () => {
      MfaOtpRequestCache.set(defaultSessionToken, scope);
      JwtTokenCache.setToken(defaultSessionToken, scope, jwt);

      // Override sessionToken to return null
      sessionTokenSpy.mockReturnValue(null);

      const e = { code: 401, errno: 223 };

      const cleared = clearMfaAndJwtCacheOnInvalidJwt(e, scope);
      expect(cleared).toBe(false);

      expect(removeOtpSpy).not.toHaveBeenCalled();
      expect(removeJwtSpy).not.toHaveBeenCalled();
    });

    it('does not throw if token does not exist by scope', () => {
      // Set a token in cache with a different scope
      JwtTokenCache.setToken(defaultSessionToken, 'email', jwt);

      const e = { code: 401, errno: 223 };

      const cleared = clearMfaAndJwtCacheOnInvalidJwt(e, scope);
      expect(cleared).toBe(true);

      expect(removeOtpSpy).toHaveBeenCalledWith(defaultSessionToken, scope);
      expect(removeJwtSpy).toHaveBeenCalledWith(defaultSessionToken, scope);
    });
  });
});

const UID = 'a'.repeat(32);
const tokenFor = (claims: unknown) =>
  [
    'header',
    bytesToBase64url(new TextEncoder().encode(JSON.stringify(claims))),
    'signature',
  ].join('.');

describe('uidFromMfaToken', () => {
  it('reads the uid the proof names', () => {
    expect(uidFromMfaToken(tokenFor({ sub: UID }))).toBe(UID);
  });

  it.each([
    ['no dot-separated payload', 'not-a-jwt'],
    ['a payload that is not base64url', 'header.!!!.signature'],
    [
      'a payload that is not JSON',
      [
        'header',
        bytesToBase64url(new TextEncoder().encode('{oops')),
        'signature',
      ].join('.'),
    ],
  ])('is undefined for %s', (_label, token) => {
    expect(uidFromMfaToken(token)).toBeUndefined();
  });

  it.each([
    ['sub is absent', {}],
    ['sub is not a string', { sub: 42 }],
    ['sub is null', { sub: null }],
    ['sub is not 32 hex characters', { sub: 'abc' }],
    ['sub carries non-hex characters', { sub: 'z'.repeat(32) }],
    ['the claims are not an object', 'a string'],
  ])('is undefined when %s', (_label, claims) => {
    expect(uidFromMfaToken(tokenFor(claims))).toBeUndefined();
  });
});
