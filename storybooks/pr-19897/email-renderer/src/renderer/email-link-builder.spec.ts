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
  };

  let linkBuilder: EmailLinkBuilder;

  beforeEach(() => {
    linkBuilder = new EmailLinkBuilder(mockConfig);
  });

  describe('urls getter', () => {
    it('should return configured URLs', () => {
      const urls = linkBuilder.urls;

      expect(urls.initiatePasswordReset).toBe(
        'http://localhost:3030/reset_password'
      );
      expect(urls.privacy).toBe('http://localhost:3030/privacy');
      expect(urls.support).toBe('http://localhost:3030/support');
    });
  });

  describe('getCampaign', () => {
    it('should return campaign with prefix for valid template', () => {
      const templateName = 'recovery';

      const campaign = linkBuilder.getCampaign(templateName);

      expect(campaign).toBe('fx-forgot-password');
    });

    it('should return empty string for unknown template', () => {
      const templateName = 'unknownTemplate';

      const campaign = linkBuilder.getCampaign(templateName);

      expect(campaign).toBe('');
    });
  });

  describe('getContent', () => {
    it('should return content for valid template', () => {
      const templateName = 'recovery';

      const content = linkBuilder.getContent(templateName);

      expect(content).toBe('reset-password');
    });

    it('should return empty string for unknown template', () => {
      const templateName = 'unknownTemplate';

      const content = linkBuilder.getContent(templateName);

      expect(content).toBe('');
    });
  });

  describe('addUTMParams', () => {
    it('should add UTM parameters when metrics enabled', () => {
      const link = new URL('http://localhost:3030/some-page');
      const templateName = 'recovery';

      linkBuilder.addUTMParams(link, templateName);

      expect(link.searchParams.get('utm_medium')).toBe('email');
      expect(link.searchParams.get('utm_campaign')).toBe('fx-forgot-password');
      expect(link.searchParams.get('utm_content')).toBe('fx-reset-password');
    });

    it('should use custom content when provided', () => {
      const link = new URL('http://localhost:3030/some-page');
      const templateName = 'recovery';
      const customContent = 'custom-content';

      linkBuilder.addUTMParams(link, templateName, customContent);

      expect(link.searchParams.get('utm_content')).toBe('fx-custom-content');
    });

    it('should not add UTM parameters when metrics disabled', () => {
      const disabledLinkBuilder = new EmailLinkBuilder({
        ...mockConfig,
        metricsEnabled: false,
      });
      const link = new URL('http://localhost:3030/some-page');
      const templateName = 'recovery';

      disabledLinkBuilder.addUTMParams(link, templateName);

      expect(link.searchParams.get('utm_medium')).toBeNull();
      expect(link.searchParams.get('utm_campaign')).toBeNull();
      expect(link.searchParams.get('utm_content')).toBeNull();
    });

    it('should not override existing utm_campaign', () => {
      const link = new URL(
        'http://localhost:3030/some-page?utm_campaign=existing'
      );
      const templateName = 'recovery';

      linkBuilder.addUTMParams(link, templateName);

      expect(link.searchParams.get('utm_campaign')).toBe('existing');
    });
  });

  describe('buildCommonLinks', () => {
    it('should build privacy and support links with UTM params', () => {
      const templateName = 'recovery';

      const links = linkBuilder.buildCommonLinks(templateName);

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
      const link = new URL('http://localhost:3030/some-page');
      const templateName = 'recovery';
      const queryParams = {
        uid: '12345',
        token: 'abc123',
        email: 'test@example.com',
      };

      linkBuilder.buildLinkWithQueryParamsAndUTM(
        link,
        templateName,
        queryParams
      );

      expect(link.searchParams.get('uid')).toBe('12345');
      expect(link.searchParams.get('token')).toBe('abc123');
      expect(link.searchParams.get('email')).toBe('test@example.com');
      expect(link.searchParams.get('utm_medium')).toBe('email');
      expect(link.searchParams.get('utm_campaign')).toBe('fx-forgot-password');
    });

    it('should handle empty query params', () => {
      const link = new URL('http://localhost:3030/some-page');
      const templateName = 'recovery';
      const queryParams = {};

      linkBuilder.buildLinkWithQueryParamsAndUTM(
        link,
        templateName,
        queryParams
      );

      expect(link.searchParams.get('utm_medium')).toBe('email');
      expect(link.searchParams.get('utm_campaign')).toBe('fx-forgot-password');
    });
  });

  describe('buildPasswordChangeRequiredLink', () => {
    it('should build password change required link with params', () => {
      const opts = {
        url: 'http://localhost:3030/reset_password',
        email: 'test@example.com',
      };

      const link = linkBuilder.buildPasswordChangeRequiredLink(opts);

      expect(link).toContain('http://localhost:3030/reset_password');
      expect(link).toContain('email=test%40example.com');
      expect(link).toContain('utm_medium=email');
      expect(link).toContain('utm_campaign=fx-password-reset-required');
    });
  });
});
