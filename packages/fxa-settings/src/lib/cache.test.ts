/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  JwtTokenCache,
  JwtNotFoundError,
  MfaOtpRequestCache,
  JwtPayload,
} from './cache';
import { AuthUiErrors } from './auth-errors/auth-errors';

// Fixed clock so `exp`/`Date.now()` comparisons are deterministic.
const MOCK_NOW_MS = 1_700_000_000_000;
const MOCK_NOW_SEC = MOCK_NOW_MS / 1000;

// Real session tokens are fixed-length 64-hex strings, so one is never a
// prefix of another. These distinct, equal-length values mirror that.
const SESSION_A = 'a'.repeat(64);
const SESSION_B = 'b'.repeat(64);

/**
 * Builds a fake JWT (`header.payload.signature`) whose middle segment is the
 * base64-encoded `payload`. Only the payload is ever decoded by the cache, so
 * the header and signature are placeholders.
 */
const makeJwt = (payload: object) =>
  `header.${btoa(JSON.stringify(payload))}.signature`;

/** A payload that satisfies `decodeTokenPayload`'s type guard. */
const makePayload = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
  aud: 'fxa',
  exp: MOCK_NOW_SEC + 600,
  iat: MOCK_NOW_SEC,
  iss: 'accounts.firefox.com',
  jti: 'jti-123',
  stid: 'session-token-id',
  sub: 'uid-123',
  scope: ['mfa:password'],
  ...overrides,
});

const VALID_JWT = makeJwt(makePayload());
const EXPIRED_JWT = makeJwt(makePayload({ exp: MOCK_NOW_SEC - 1 }));

describe('cache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(MOCK_NOW_MS));

    localStorage.clear();
    (JwtTokenCache as any)._state = undefined;
    (JwtTokenCache as any).listeners.clear();
    (MfaOtpRequestCache as any)._state = undefined;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('JwtTokenCache', () => {
    describe('getKey', () => {
      it('joins the session token and scope', () => {
        expect(JwtTokenCache.getKey(SESSION_A, 'password')).toBe(
          `${SESSION_A}-password`
        );
      });
    });

    describe('setToken / getToken', () => {
      it('stores and returns a token for a session and scope', () => {
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        expect(JwtTokenCache.getToken(SESSION_A, 'password')).toBe(VALID_JWT);
      });

      it('scopes tokens independently for the same session', () => {
        const emailJwt = makeJwt(makePayload({ scope: ['mfa:email'] }));
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        JwtTokenCache.setToken(SESSION_A, 'email', emailJwt);

        expect(JwtTokenCache.getToken(SESSION_A, 'password')).toBe(VALID_JWT);
        expect(JwtTokenCache.getToken(SESSION_A, 'email')).toBe(emailJwt);
      });

      it('throws JwtNotFoundError when no token exists', () => {
        expect(() => JwtTokenCache.getToken(SESSION_A, 'password')).toThrow(
          JwtNotFoundError
        );
      });

      it.each([
        ['session token', '', 'password', VALID_JWT, 'Invalid sessionToken'],
        ['scope', SESSION_A, '', VALID_JWT, 'Invalid scope'],
        ['jwt', SESSION_A, 'password', '', 'Invalid jwt'],
      ])(
        'throws when the %s is missing',
        (_label, session, scope, jwt, message) => {
          expect(() =>
            JwtTokenCache.setToken(session as string, scope as any, jwt as string)
          ).toThrow(message as string);
        }
      );
    });

    describe('removeToken', () => {
      it('removes a single token', () => {
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        JwtTokenCache.removeToken(SESSION_A, 'password');
        expect(() => JwtTokenCache.getToken(SESSION_A, 'password')).toThrow(
          JwtNotFoundError
        );
      });

      it('leaves other scopes on the same session intact', () => {
        const emailJwt = makeJwt(makePayload({ scope: ['mfa:email'] }));
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        JwtTokenCache.setToken(SESSION_A, 'email', emailJwt);

        JwtTokenCache.removeToken(SESSION_A, 'password');

        expect(JwtTokenCache.getToken(SESSION_A, 'email')).toBe(emailJwt);
      });
    });

    describe('clearTokens', () => {
      it('removes every scope for the given session', () => {
        const emailJwt = makeJwt(makePayload({ scope: ['mfa:email'] }));
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        JwtTokenCache.setToken(SESSION_A, 'email', emailJwt);

        JwtTokenCache.clearTokens(SESSION_A);

        expect(() => JwtTokenCache.getToken(SESSION_A, 'password')).toThrow(
          JwtNotFoundError
        );
        expect(() => JwtTokenCache.getToken(SESSION_A, 'email')).toThrow(
          JwtNotFoundError
        );
      });

      it('does not touch tokens belonging to a different session', () => {
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        JwtTokenCache.setToken(SESSION_B, 'password', VALID_JWT);

        JwtTokenCache.clearTokens(SESSION_A);

        expect(JwtTokenCache.getToken(SESSION_B, 'password')).toBe(VALID_JWT);
      });
    });

    describe('hasToken', () => {
      it('returns true for a present, unexpired token', () => {
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        expect(JwtTokenCache.hasToken(SESSION_A, 'password')).toBe(true);
      });

      it('returns false when no token is cached', () => {
        expect(JwtTokenCache.hasToken(SESSION_A, 'password')).toBe(false);
      });

      it('returns false for an expired token', () => {
        JwtTokenCache.setToken(SESSION_A, 'password', EXPIRED_JWT);
        expect(JwtTokenCache.hasToken(SESSION_A, 'password')).toBe(false);
      });
    });

    describe('isExpired', () => {
      it('returns true when exp is in the past', () => {
        expect(JwtTokenCache.isExpired(EXPIRED_JWT)).toBe(true);
      });

      it('returns false when exp is in the future', () => {
        expect(JwtTokenCache.isExpired(VALID_JWT)).toBe(false);
      });

      it('returns false when the token cannot be decoded', () => {
        expect(JwtTokenCache.isExpired('not-a-jwt')).toBe(false);
      });
    });

    describe('decodeTokenPayload', () => {
      it('decodes a well-formed payload', () => {
        const payload = makePayload();
        expect(JwtTokenCache.decodeTokenPayload(makeJwt(payload))).toEqual(
          payload
        );
      });

      it('returns null for a string without a payload segment', () => {
        expect(JwtTokenCache.decodeTokenPayload('not-a-jwt')).toBeNull();
      });

      it('returns null when a required claim is missing', () => {
        const { stid, ...withoutStid } = makePayload();
        expect(
          JwtTokenCache.decodeTokenPayload(makeJwt(withoutStid))
        ).toBeNull();
      });

      it('returns null when scope is not an array', () => {
        const badScope = makeJwt(makePayload({ scope: 'mfa:password' as any }));
        expect(JwtTokenCache.decodeTokenPayload(badScope)).toBeNull();
      });
    });

    describe('persistence', () => {
      it('rehydrates cached tokens from localStorage', () => {
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);

        // Drop the in-memory state to force a read from storage.
        (JwtTokenCache as any)._state = undefined;

        expect(JwtTokenCache.getToken(SESSION_A, 'password')).toBe(VALID_JWT);
      });
    });

    describe('subscribe / getSnapshot', () => {
      it('exposes the current tokens via getSnapshot', () => {
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        expect(JwtTokenCache.getSnapshot()).toEqual({
          [`${SESSION_A}-password`]: VALID_JWT,
        });
      });

      it('returns a new snapshot reference on mutation so consumers re-render', () => {
        const before = JwtTokenCache.getSnapshot();
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);
        expect(JwtTokenCache.getSnapshot()).not.toBe(before);
      });

      it.each([
        ['setToken', () => JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT)],
        [
          'removeToken',
          () => JwtTokenCache.removeToken(SESSION_A, 'password'),
        ],
        ['clearTokens', () => JwtTokenCache.clearTokens(SESSION_A)],
      ])('notifies subscribers on %s', (_label, mutate) => {
        const listener = jest.fn();
        JwtTokenCache.subscribe(listener);

        mutate();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('stops notifying after unsubscribe', () => {
        const listener = jest.fn();
        const unsubscribe = JwtTokenCache.subscribe(listener);

        unsubscribe();
        JwtTokenCache.setToken(SESSION_A, 'password', VALID_JWT);

        expect(listener).not.toHaveBeenCalled();
      });
    });
  });

  describe('JwtNotFoundError', () => {
    it('mirrors the auth server invalid-MFA-token error shape', () => {
      const error = new JwtNotFoundError();
      expect(error.errno).toBe(AuthUiErrors.INVALID_MFA_TOKEN.errno);
      expect(error.code).toBe(401);
      expect(error.message).toBe('Could not locate jwt in cache.');
    });
  });

  describe('MfaOtpRequestCache', () => {
    describe('getKey', () => {
      it('joins the session token and scope', () => {
        expect(MfaOtpRequestCache.getKey(SESSION_A, 'password')).toBe(
          `${SESSION_A}-password`
        );
      });
    });

    describe('set / get', () => {
      it('records the request time for a session and scope', () => {
        MfaOtpRequestCache.set(SESSION_A, 'password');
        expect(MfaOtpRequestCache.get(SESSION_A, 'password')).toBe(MOCK_NOW_MS);
      });

      it('returns undefined when no request was recorded', () => {
        expect(
          MfaOtpRequestCache.get(SESSION_A, 'password')
        ).toBeUndefined();
      });
    });

    describe('remove', () => {
      it('clears a single recorded request', () => {
        MfaOtpRequestCache.set(SESSION_A, 'password');
        MfaOtpRequestCache.remove(SESSION_A, 'password');
        expect(
          MfaOtpRequestCache.get(SESSION_A, 'password')
        ).toBeUndefined();
      });
    });

    describe('clear', () => {
      it('removes every scope for the given session', () => {
        MfaOtpRequestCache.set(SESSION_A, 'password');
        MfaOtpRequestCache.set(SESSION_A, 'email');

        MfaOtpRequestCache.clear(SESSION_A);

        expect(
          MfaOtpRequestCache.get(SESSION_A, 'password')
        ).toBeUndefined();
        expect(MfaOtpRequestCache.get(SESSION_A, 'email')).toBeUndefined();
      });

      it('does not touch requests belonging to a different session', () => {
        MfaOtpRequestCache.set(SESSION_A, 'password');
        MfaOtpRequestCache.set(SESSION_B, 'password');

        MfaOtpRequestCache.clear(SESSION_A);

        expect(MfaOtpRequestCache.get(SESSION_B, 'password')).toBe(MOCK_NOW_MS);
      });
    });

    describe('persistence', () => {
      it('rehydrates recorded requests from localStorage', () => {
        MfaOtpRequestCache.set(SESSION_A, 'password');

        // Drop the in-memory state to force a read from storage.
        (MfaOtpRequestCache as any)._state = undefined;

        expect(MfaOtpRequestCache.get(SESSION_A, 'password')).toBe(MOCK_NOW_MS);
      });
    });
  });
});
