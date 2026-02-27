/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailLinkBuilder } from './email-link-builder';

describe('EmailLinkBuilder', () => {
  const mockConfig = {
    metricsEnabled: true,
    initiatePasswordResetUrl: 'http://localhost:3030/reset_password',
    privacyUrl: 'http://localhost:3030/privacy',
    supportUrl: 'http://localhost:3030/support',
    accountSettingsUrl: 'http://localhost:3030/settings',
    passwordResetUrl: 'http://localhost:3030/reset_password_xxx',
    verificationUrl: 'http://localhost:3030/verify_email',
    verifyLoginUrl: 'http://localhost:3030/complete_signin',
    prependVerificationSubdomain: {
      enabled: true,
      subdomain: 'test',
    },
  };

  let linkBuilder: EmailLinkBuilder;

  beforeEach(() => {
    linkBuilder = new EmailLinkBuilder(mockConfig);
  });

  describe('buildCommonLinks', () => {
    it('should build privacy and support links with UTM params', () => {
      const templateName = 'recovery';

      const links = linkBuilder.buildCommonLinks(templateName, true);

      expect(links.privacyUrl).toContain('http://localhost:3030/privacy');
      expect(links.privacyUrl).toContain('utm_medium=email');
      expect(links.privacyUrl).toContain('utm_campaign=fx-forgot-password');
      expect(links.privacyUrl).toContain('utm_content=fx-privacy');

      expect(links.supportUrl).toContain('http://localhost:3030/support');
      expect(links.supportUrl).toContain('utm_medium=email');
      expect(links.supportUrl).toContain('utm_campaign=fx-forgot-password');
      expect(links.supportUrl).toContain('utm_content=fx-support');
    });
  });

  describe('buildLinkWithQueryParamsAndUTM', () => {
    it('should add query params and UTM params to link', () => {
      const link = linkBuilder.buildLinkWithQueryParamsAndUTM(
        'http://localhost:3030/some-page',
        'recovery',
        {
          uid: '12345',
          token: 'abc123',
          email: 'test@example.com',
        },
        true
      );

      const url = new URL(link);
      expect(url.searchParams.get('uid')).toBe('12345');
      expect(url.searchParams.get('token')).toBe('abc123');
      expect(url.searchParams.get('email')).toBe('test@example.com');
      expect(url.searchParams.get('utm_medium')).toBe('email');
      expect(url.searchParams.get('utm_campaign')).toBe('fx-forgot-password');
    });

    it('should handle empty query params', () => {
      const templateName = 'recovery';
      const queryParams = {};

      const link = linkBuilder.buildLinkWithQueryParamsAndUTM(
        'http://localhost:3030/some-page',
        templateName,
        queryParams,
        true
      );

      const url = new URL(link);
      expect(url.searchParams.get('utm_medium')).toBe('email');
      expect(url.searchParams.get('utm_campaign')).toBe('fx-forgot-password');
    });

    it('should respect metricsEnabled flag', () => {
      const link = linkBuilder.buildLinkWithQueryParamsAndUTM(
        'http://localhost:3030/some-page',
        'recovery',
        {},
        false
      );

      const url = new URL(link);
      expect(url.searchParams.get('utm_medium')).toBeNull();
      expect(url.searchParams.get('utm_campaign')).toBeNull();
    });
  });

  describe('buildPasswordChangeRequiredLink', () => {
    it('should build password change required link with params', () => {
      const opts = {
        url: 'http://localhost:3030/reset_password',
        email: 'test@example.com',
      };

      const link = linkBuilder.buildPasswordChangeRequiredLink(
        opts.url,
        opts.email,
        true
      );

      expect(link).toContain('http://localhost:3030/reset_password');
      expect(link).toContain('email=test%40example.com');
      expect(link).toContain('utm_medium=email');
      expect(link).toContain('utm_campaign=fx-password-reset-required');
    });
  });
});
