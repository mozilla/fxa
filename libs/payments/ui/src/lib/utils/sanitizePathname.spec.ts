/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { sanitizePathname } from './sanitizePathname';

describe('sanitizePathname', () => {
  describe('valid pathnames', () => {
    it('should accept valid relative pathnames', () => {
      expect(sanitizePathname('/en/vpn/monthly/checkout/cart123/start')).toBe(
        '/en/vpn/monthly/checkout/cart123/start'
      );
      expect(sanitizePathname('/en/vpn/monthly/checkout/cart123/error')).toBe(
        '/en/vpn/monthly/checkout/cart123/error'
      );
      expect(sanitizePathname('/simple/path')).toBe('/simple/path');
      expect(sanitizePathname('/')).toBe('/');
    });

    it('should normalize paths with query strings', () => {
      expect(
        sanitizePathname('/en/vpn/monthly/checkout/cart123/start?foo=bar')
      ).toBe('/en/vpn/monthly/checkout/cart123/start');
    });

    it('should normalize paths with fragments', () => {
      expect(
        sanitizePathname('/en/vpn/monthly/checkout/cart123/start#section')
      ).toBe('/en/vpn/monthly/checkout/cart123/start');
    });

    it('should normalize paths with ../ (path traversal)', () => {
      // Path traversal is normalized by URL constructor
      expect(sanitizePathname('/en/../vpn/monthly')).toBe('/vpn/monthly');
      expect(sanitizePathname('/en/vpn/../../other')).toBe('/other');
    });
  });

  describe('security - should reject malicious pathnames', () => {
    it('should reject absolute URLs with http://', () => {
      expect(() =>
        sanitizePathname('http://evil.com/phishing')
      ).toThrow('Absolute URLs are not allowed');
    });

    it('should reject absolute URLs with https://', () => {
      expect(() =>
        sanitizePathname('https://evil.com/phishing')
      ).toThrow('Absolute URLs are not allowed');
    });

    it('should reject protocol-relative URLs', () => {
      expect(() =>
        sanitizePathname('//evil.com/phishing')
      ).toThrow('Absolute URLs are not allowed');
    });

    it('should reject javascript: URLs', () => {
      expect(() =>
        sanitizePathname('javascript:alert(1)')
      ).toThrow();
    });

    it('should reject data: URLs', () => {
      expect(() =>
        sanitizePathname('data:text/html,<script>alert(1)</script>')
      ).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should reject empty strings', () => {
      expect(() => sanitizePathname('')).toThrow(
        'Invalid pathname: must be a non-empty string'
      );
    });

    it('should reject non-string inputs', () => {
      expect(() => sanitizePathname(null as any)).toThrow(
        'Invalid pathname: must be a non-empty string'
      );
      expect(() => sanitizePathname(undefined as any)).toThrow(
        'Invalid pathname: must be a non-empty string'
      );
      expect(() => sanitizePathname(123 as any)).toThrow(
        'Invalid pathname: must be a non-empty string'
      );
    });

    it('should handle encoded characters', () => {
      expect(sanitizePathname('/en/vpn%20test/monthly')).toBe(
        '/en/vpn%20test/monthly'
      );
    });

    it('should handle multiple slashes', () => {
      expect(sanitizePathname('/en//vpn///monthly')).toBe('/en//vpn///monthly');
    });
  });
});
