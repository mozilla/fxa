/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSafeRedirectUrl } from './getSafeRedirectUrl';

describe('getSafeRedirectUrl', () => {
  const baseUrl = 'https://payments.example.com';
  const contentServerUrl = 'https://accounts.example.com';
  const allowedOrigins = [contentServerUrl, baseUrl];

  it('resolves same-origin relative paths against baseUrl', () => {
    expect(getSafeRedirectUrl('/checkout', baseUrl, allowedOrigins)).toBe(
      `${baseUrl}/checkout`
    );
  });

  it('returns a url whose origin equals baseUrl', () => {
    const url = `${baseUrl}/success?foo=bar`;
    expect(getSafeRedirectUrl(url, baseUrl, allowedOrigins)).toBe(url);
  });

  it('returns a url whose origin is on the allow-list', () => {
    const url = `${contentServerUrl}/settings`;
    expect(getSafeRedirectUrl(url, baseUrl, allowedOrigins)).toBe(url);
  });

  it('falls back to baseUrl for a disallowed origin', () => {
    expect(
      getSafeRedirectUrl('https://evil.example', baseUrl, allowedOrigins)
    ).toBe(baseUrl);
  });

  it('falls back to baseUrl for a tossed sibling-subdomain origin', () => {
    expect(
      getSafeRedirectUrl(
        'https://evil.firefox.com',
        baseUrl,
        allowedOrigins
      )
    ).toBe(baseUrl);
  });

  it('falls back to baseUrl for a malformed url', () => {
    expect(getSafeRedirectUrl('not a url', baseUrl, allowedOrigins)).toBe(
      baseUrl
    );
  });

  it('neutralizes protocol-relative urls by prefixing baseUrl', () => {
    expect(
      getSafeRedirectUrl('//evil.example', baseUrl, allowedOrigins)
    ).toBe(`${baseUrl}//evil.example`);
  });
});
