/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FxaOAuthJwtStrategy } from './fxa-oauth-jwt.strategy';
import { MockFxaOAuthConfig } from './fxa-oauth.config';
import { FxaAccessTokenClaimsFactory } from './factories/fxa-access-token-claims.factory';
import {
  JwtInsufficientScopeError,
  JwtInvalidClaimsError,
} from './fxa-oauth.error';

// Mock jwks-rsa to avoid real JWKS fetching during construction
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(() => (_req: any, _raw: any, done: any) =>
    done(null, 'mock-secret')
  ),
}));

/** Build a mock Express Request. */
function makeReq(): any {
  return { headers: {} };
}

describe('FxaOAuthJwtStrategy', () => {
  let strategy: FxaOAuthJwtStrategy;

  beforeEach(() => {
    strategy = new FxaOAuthJwtStrategy(MockFxaOAuthConfig);
  });

  it('returns user with scope array when required scope is present', () => {
    const claims = FxaAccessTokenClaimsFactory({
      scope: MockFxaOAuthConfig.fxaOAuthRequiredScope,
    });
    const result = strategy.validate(makeReq(), claims);
    expect(result).toEqual({
      sub: claims.sub,
      client_id: claims.client_id,
      scope: [MockFxaOAuthConfig.fxaOAuthRequiredScope],
    });
  });

  it('returns user with scope array when required scope is among multiple scopes', () => {
    const claims = FxaAccessTokenClaimsFactory({
      scope: `profile ${MockFxaOAuthConfig.fxaOAuthRequiredScope} openid`,
    });
    const result = strategy.validate(makeReq(), claims);
    expect(result).toEqual({
      sub: claims.sub,
      client_id: claims.client_id,
      scope: ['profile', MockFxaOAuthConfig.fxaOAuthRequiredScope, 'openid'],
    });
  });

  it('throws JwtInsufficientScopeError when required scope is missing', () => {
    const claims = FxaAccessTokenClaimsFactory({ scope: 'profile openid' });
    expect(() => strategy.validate(makeReq(), claims)).toThrow(
      JwtInsufficientScopeError
    );
  });

  it('throws JwtInsufficientScopeError when scope is empty', () => {
    const claims = FxaAccessTokenClaimsFactory({ scope: '' });
    expect(() => strategy.validate(makeReq(), claims)).toThrow(
      JwtInsufficientScopeError
    );
  });

  it('throws JwtInvalidClaimsError when scope is undefined (fails schema)', () => {
    const claims = FxaAccessTokenClaimsFactory({ scope: undefined } as any);
    expect(() => strategy.validate(makeReq(), claims)).toThrow(
      JwtInvalidClaimsError
    );
  });

  it('throws JwtInvalidClaimsError when the claims fail schema validation', () => {
    expect(() => strategy.validate(makeReq(), { not: 'valid claims' })).toThrow(
      JwtInvalidClaimsError
    );
  });
});
