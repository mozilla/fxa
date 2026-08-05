/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const requestHelper = require('./request_helper');

describe('requestHelper', () => {
  it('interface is correct', () => {
    expect(typeof requestHelper).toBe('object');
    expect(Object.keys(requestHelper).length).toBe(3);
    expect(typeof requestHelper.wantsKeys).toBe('function');
    expect(typeof requestHelper.hasProvenSession).toBe('function');
  });

  describe('hasProvenSession', () => {
    const withCredentials = (credentials: object) => ({
      auth: { credentials },
    });

    it.each([
      { name: 'a confirmed session', emailVerified: true, tokenVerified: true },
      {
        name: 'a session that never had to confirm',
        emailVerified: true,
        mustVerify: false,
      },
    ])('is true for $name', ({ name, ...credentials }) => {
      expect(requestHelper.hasProvenSession(withCredentials(credentials))).toBe(
        true
      );
    });

    it.each([
      { name: 'an unverified email', emailVerified: false },
      {
        name: 'a session still owing confirmation',
        emailVerified: true,
        mustVerify: true,
        tokenVerified: false,
      },
      { name: 'a token carrying no session fields', other: 'value' },
    ])('is false for $name', ({ name, ...credentials }) => {
      expect(requestHelper.hasProvenSession(withCredentials(credentials))).toBe(
        false
      );
    });

    it('is false when the request carries no credentials', () => {
      expect(requestHelper.hasProvenSession({})).toBe(false);
    });
  });

  it('wantsKeys', () => {
    expect(!!requestHelper.wantsKeys({})).toBe(false);
    expect(requestHelper.wantsKeys({ query: {} })).toBe(false);
    expect(requestHelper.wantsKeys({ query: { keys: false } })).toBe(false);
    expect(requestHelper.wantsKeys({ query: { keys: true } })).toBe(true);
  });
});
