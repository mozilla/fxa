/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const validators = require('./validators');

describe('oauth scope validator', () => {
  it('parses a valid scope string into a ScopeSet', () => {
    const { value, error } = validators.scope.validate('profile:email');
    expect(error).toBeUndefined();
    expect(value.getScopeValues()).toEqual(['profile:email']);
  });

  it('accepts an empty scope as an empty ScopeSet', () => {
    const { value, error } = validators.scope.validate('');
    expect(error).toBeUndefined();
    expect(value.isEmpty()).toBe(true);
  });

  it('rejects a scope string longer than 256 characters', () => {
    const { error } = validators.scope.validate('a'.repeat(257));
    expect(error).toBeDefined();
    expect(error.message).toContain('needs to be a valid scope string');
  });

  it('rejects an oversized many-component scope before expansion', () => {
    const { error } = validators.scope.validate(
      new Array(4000).fill('a').join(':')
    );
    expect(error).toBeDefined();
  });

  it('rejects a scope containing invalid characters', () => {
    const { error } = validators.scope.validate('profile:email!');
    expect(error).toBeDefined();
    expect(error.message).toContain('needs to be a valid scope string');
  });
});

describe('oauth accessToken validator', () => {
  // Shaped like a real Fenix access token: a 75-character base64url header and
  // a 342-character RS256 signature, with the payload making up the rest.
  const HEADER_LENGTH = 75;
  const SIGNATURE_LENGTH = 342;
  const jwtOfLength = (length: number) =>
    [
      'h'.repeat(HEADER_LENGTH),
      'p'.repeat(length - HEADER_LENGTH - SIGNATURE_LENGTH - 2),
      's'.repeat(SIGNATURE_LENGTH),
    ].join('.');

  const OPAQUE_ACCESS_TOKEN = 'a'.repeat(64);

  it('accepts an opaque 64-character hex access token', () => {
    const { error } = validators.accessToken.validate(OPAQUE_ACCESS_TOKEN);
    expect(error).toBeUndefined();
  });

  // A JWT access token grows with the scopes on the grant: real tokens reach
  // ~1150 characters with sync, session, VPN and Relay together. The bound
  // also gates the is-this-a-JWT test in ./token.js, so an undersized one
  // breaks verification as well as minting.
  it.each([1030, 1147])(
    'accepts a %i character JWT access token',
    (length: number) => {
      const jwt = jwtOfLength(length);
      expect(jwt).toHaveLength(length);
      expect(validators.accessToken.validate(jwt).error).toBeUndefined();
      expect(validators.jwt.validate(jwt).error).toBeUndefined();
    }
  );

  it('accepts a JWT at the 2048 character bound', () => {
    const { error } = validators.accessToken.validate(jwtOfLength(2048));
    expect(error).toBeUndefined();
  });

  it('rejects a JWT longer than 2048 characters', () => {
    const { error } = validators.accessToken.validate(jwtOfLength(2049));
    expect(error).toBeDefined();
  });

  it('rejects a token that is neither hex nor JWT shaped', () => {
    const { error } = validators.accessToken.validate('not.a@token');
    expect(error).toBeDefined();
  });
});
