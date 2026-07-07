/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  FxaOAuthError,
  JwtInsufficientScopeError,
  JwtInvalidClaimsError,
  NoBearerTokenError,
  OAuthTokenRejectedError,
  OAuthVerifyNetworkError,
  OAuthVerifyResponseParseError,
  OAuthVerifyResponseSchemaError,
  OAuthVerifyServerError,
  OAuthVerifyUpstreamError,
  VerifyInsufficientScopeError,
} from './fxa-oauth.error';

// Each error is instantiated once here so the `.name` assertion below can run
// generically. Names are load-bearing: they are tagged on the `auth.fail`
// metric's `reason` dimension and written to the log, so a rename/typo (or a
// minifier mangling a class name) would silently corrupt telemetry.
const CASES: [FxaOAuthError, string][] = [
  [new NoBearerTokenError(), 'NoBearerTokenError'],
  [new OAuthTokenRejectedError(401), 'OAuthTokenRejectedError'],
  [new OAuthVerifyNetworkError(new Error('ECONNREFUSED')), 'OAuthVerifyNetworkError'],
  [new OAuthVerifyServerError(503), 'OAuthVerifyServerError'],
  [new OAuthVerifyResponseParseError(new Error('bad json')), 'OAuthVerifyResponseParseError'],
  [new OAuthVerifyResponseSchemaError(), 'OAuthVerifyResponseSchemaError'],
  [new VerifyInsufficientScopeError(), 'VerifyInsufficientScopeError'],
  [new JwtInvalidClaimsError(), 'JwtInvalidClaimsError'],
  [new JwtInsufficientScopeError(), 'JwtInsufficientScopeError'],
];

describe('fxa-oauth errors', () => {
  it.each(CASES)('%o has name matching its class', (error, expectedName) => {
    expect(error.name).toBe(expectedName);
    expect(error).toBeInstanceOf(FxaOAuthError);
  });

  describe('503 grouping (guard maps OAuthVerifyUpstreamError -> 503)', () => {
    it.each([
      new OAuthVerifyNetworkError(new Error('ECONNREFUSED')),
      new OAuthVerifyServerError(503),
      new OAuthVerifyResponseParseError(new Error('bad json')),
      new OAuthVerifyResponseSchemaError(),
    ])('%o is an OAuthVerifyUpstreamError', (error) => {
      expect(error).toBeInstanceOf(OAuthVerifyUpstreamError);
    });

    it.each([
      new NoBearerTokenError(),
      new OAuthTokenRejectedError(401),
      new VerifyInsufficientScopeError(),
      new JwtInvalidClaimsError(),
      new JwtInsufficientScopeError(),
    ])('%o is NOT an OAuthVerifyUpstreamError (maps to 401)', (error) => {
      expect(error).not.toBeInstanceOf(OAuthVerifyUpstreamError);
    });
  });

  it('embeds the upstream HTTP status in the message for triage', () => {
    expect(new OAuthTokenRejectedError(429).message).toContain('429');
    expect(new OAuthVerifyServerError(502).message).toContain('502');
  });
});
