/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { stripPIIFromUrl } = require('./url-scrubber');

describe('stripPIIFromUrl', () => {
  it('returns "" for empty / non-string input', () => {
    expect(stripPIIFromUrl('')).toBe('');
    expect(stripPIIFromUrl(undefined)).toBe('');
    expect(stripPIIFromUrl(null)).toBe('');
    expect(stripPIIFromUrl(42)).toBe('');
    expect(stripPIIFromUrl({})).toBe('');
  });

  it('removes email and uid query params, preserving others', () => {
    const scrubbed = stripPIIFromUrl(
      'https://accounts.firefox.com/signin?email=user@example.com&uid=deadbeef&foo=bar'
    );
    expect(scrubbed).not.toContain('email=');
    expect(scrubbed).not.toContain('uid=');
    expect(scrubbed).not.toContain('user@example.com');
    expect(scrubbed).toContain('foo=bar');
  });

  it('drops the fragment (can carry tokens)', () => {
    const scrubbed = stripPIIFromUrl(
      'https://accounts.firefox.com/reset#token=secret'
    );
    expect(scrubbed).not.toContain('token=secret');
    expect(scrubbed).not.toContain('#');
  });

  it('leaves a clean URL essentially unchanged', () => {
    const scrubbed = stripPIIFromUrl(
      'https://accounts.firefox.com/settings/app.js'
    );
    expect(scrubbed).toBe('https://accounts.firefox.com/settings/app.js');
  });

  it('returns non-URL tokens unchanged (e.g. CSP keywords)', () => {
    expect(stripPIIFromUrl('inline')).toBe('inline');
    expect(stripPIIFromUrl('eval')).toBe('eval');
  });

  it('scrubs relative URLs too, preserving the relative shape', () => {
    expect(
      stripPIIFromUrl('/reset?email=user@example.com&uid=abc&keep=1')
    ).toBe('/reset?keep=1');
    // No PII -> returned unchanged.
    expect(stripPIIFromUrl('/relative/path')).toBe('/relative/path');
  });

  it('strips PII case-sensitively per the known param names', () => {
    // Only the exact lower-case param names are stripped; documents the contract.
    const scrubbed = stripPIIFromUrl(
      'https://accounts.firefox.com/x?uid=abc&other=keep'
    );
    expect(scrubbed).not.toContain('uid=');
    expect(scrubbed).toContain('other=keep');
  });
});
