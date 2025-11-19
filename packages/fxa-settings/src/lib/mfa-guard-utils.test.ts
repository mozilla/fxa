/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { JwtTokenCache, MfaOtpRequestCache } from './cache';
import {
  clearMfaAndJwtCacheOnInvalidJwt,
  isInvalidJwtError,
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
    it('should return true if the error is an invalid JWT error', () => {
      expect(isInvalidJwtError({ code: 401, errno: 223 })).toBe(true);
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

      clearMfaAndJwtCacheOnInvalidJwt(e, scope);

      expect(removeOtpSpy).not.toHaveBeenCalled();
      expect(removeJwtSpy).not.toHaveBeenCalled();
    });

    it('should not clear the MFA and JWT cache if the session token is null', () => {
      MfaOtpRequestCache.set(defaultSessionToken, scope);
      JwtTokenCache.setToken(defaultSessionToken, scope, jwt);

      // Override sessionToken to return null
      sessionTokenSpy.mockReturnValue(null);

      const e = { code: 401, errno: 223 };

      clearMfaAndJwtCacheOnInvalidJwt(e, scope);

      expect(removeOtpSpy).not.toHaveBeenCalled();
      expect(removeJwtSpy).not.toHaveBeenCalled();
    });

    it('does not throw if token does not exist by scope', () => {
      // Set a token in cache with a different scope
      JwtTokenCache.setToken(defaultSessionToken, 'email', jwt);

      const e = { code: 401, errno: 223 };

      expect(() => clearMfaAndJwtCacheOnInvalidJwt(e, scope)).not.toThrow();

      expect(removeOtpSpy).toHaveBeenCalledWith(defaultSessionToken, scope);
      expect(removeJwtSpy).toHaveBeenCalledWith(defaultSessionToken, scope);
    });
  });
});
