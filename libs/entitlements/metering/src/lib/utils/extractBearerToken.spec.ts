/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { extractBearerToken } from './extractBearerToken';

describe('extractBearerToken', () => {
  it('returns the token after a Bearer prefix', () => {
    expect(extractBearerToken('Bearer abc123')).toBe('abc123');
  });

  it('matches case-insensitively', () => {
    expect(extractBearerToken('bearer abc123')).toBe('abc123');
    expect(extractBearerToken('BEARER abc123')).toBe('abc123');
  });

  it('strips surrounding whitespace from the header and the token', () => {
    expect(extractBearerToken('  Bearer   abc123  ')).toBe('abc123');
  });

  it('uses the first value when the header is an array', () => {
    expect(extractBearerToken(['Bearer xyz', 'Bearer other'])).toBe('xyz');
  });

  it('returns null when the header is missing', () => {
    expect(extractBearerToken(undefined)).toBeNull();
  });

  it('returns null when the header does not start with Bearer', () => {
    expect(extractBearerToken('Token abc')).toBeNull();
    expect(extractBearerToken('abc')).toBeNull();
  });

  it('returns null when the token portion is empty', () => {
    expect(extractBearerToken('Bearer ')).toBeNull();
  });
});
