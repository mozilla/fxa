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

    baseUri: 'http://localhost:30303',
    androidUrl:
      'https://app.adjust.com/2uo1qc?campaign=fxa-conf-email&adgroup=android&creative=button&utm_source=email',
    iosUrl:
      'https://app.adjust.com/2uo1qc?campaign=fxa-conf-email&adgroup=ios&creative=button&fallback=https%3A%2F%2Fitunes.apple.com%2Fapp%2Fapple-store%2Fid989804926%3Fpt%3D373246%26ct%3Dadjust_tracker%26mt%3D8&utm_source=email',
    mozillaSupportUrl: 'https://support.mozilla.org',
    twoFactorSupportUrl:
      'https://privacyportal.onetrust.com/webform/1350748f-7139-405c-8188-22740b3b5587/4ba08202-2ede-4934-a89e-f0b0870f95f0',
    subscriptionSupportUrl: 'https://support.mozilla.org/products',
    subscriptionTermsUrl:
      'https://www.mozilla.org/about/legal/terms/subscription-services',
    defaultSurveyUrl:
      'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21',
    firefoxDesktopUrl:
      'https://firefox.com?utm_content=registration-confirmation&utm_medium=email&utm_source=fxa',
    unsubscribeUrl:
      'https://privacyportal.onetrust.com/webform/1350748f-7139-405c-8188-22740b3b5587/4ba08202-2ede-4934-a89e-f0b0870f95f0',
  };

  let linkBuilder: EmailLinkBuilder;

  beforeEach(() => {
    linkBuilder = new EmailLinkBuilder(mockConfig);
  });

  describe('buildPasswordChangeRequiredLink', () => {
    it('should build password change required link with params', () => {
      const link = linkBuilder.buildPasswordChangeRequiredLink(
        'passwordChangeRequired',
        true,
        { email: 'foo@mozilla.com' }
      );

      // There will be no utm_campaign because, passwordChangeRequired has no campaign mapping.
      expect(link).toEqual(
        'http://localhost:30303/settings/change_password?utm_medium=email&utm_content=fx-change-password&email=foo%40mozilla.com'
      );
    });

    it('should build password change required link without utml params', () => {
      const link = linkBuilder.buildPasswordChangeRequiredLink(
        'passwordChangeRequired',
        false,
        { email: 'foo@mozilla.com' }
      );

      // There will be no utm_campaign because, passwordChangeRequired has no campaign mapping.
      expect(link).toEqual(
        'http://localhost:30303/settings/change_password?email=foo%40mozilla.com'
      );
    });
  });

  describe('buildPasswordChangeLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildPasswordChangeLink('recovery', true, {
        email: 'foo@mozilla.com',
      });
      expect(link).toEqual(
        'http://localhost:30303/settings/change_password?utm_medium=email&utm_campaign=fx-forgot-password&utm_content=fx-change-password&email=foo%40mozilla.com'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildPasswordChangeLink('recovery', false, {
        email: 'foo@mozilla.com',
      });
      expect(link).toEqual(
        'http://localhost:30303/settings/change_password?email=foo%40mozilla.com'
      );
    });
  });

  describe('buildRevokeAccountRecoveryLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildRevokeAccountRecoveryLink('recovery', true);
      expect(link).toEqual(
        'http://localhost:30303/settings?utm_medium=email&utm_campaign=fx-forgot-password&utm_content=fx-report#recovery-key'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildRevokeAccountRecoveryLink(
        'recovery',
        false
      );
      expect(link).toEqual('http://localhost:30303/settings#recovery-key');
    });
  });

  describe('buildLowRecoveryCodesLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildLowRecoveryCodesLink(
        'lowRecoveryCodes',
        true,
        {
          email: 'foo@mozilla.com',
          uid: '123',
        }
      );
      expect(link).toEqual(
        'http://localhost:30303/settings/two_step_authentication/replace_codes?utm_medium=email&utm_campaign=fx-low-recovery-codes&utm_content=fx-low-recovery-codes&low_recovery_codes=true&email=foo%40mozilla.com&uid=123'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildLowRecoveryCodesLink(
        'lowRecoveryCodes',
        false,
        {
          email: 'foo@mozilla.com',
          uid: '123',
        }
      );
      expect(link).toEqual(
        'http://localhost:30303/settings/two_step_authentication/replace_codes?low_recovery_codes=true&email=foo%40mozilla.com&uid=123'
      );
    });
  });
  describe('buildPostNewRecoveryCodesLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildPostNewRecoveryCodesLink(
        'postNewRecoveryCodes',
        true,
        {
          email: 'foo@mozilla.com',
          uid: '123',
        }
      );
      expect(link).toEqual(
        'http://localhost:30303/settings?utm_medium=email&utm_campaign=fx-account-replace-recovery-codes&utm_content=fx-account-replace-recovery-codes&email=foo%40mozilla.com&uid=123'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildPostNewRecoveryCodesLink(
        'postNewRecoveryCodes',
        false,
        {
          email: 'foo@mozilla.com',
          uid: '123',
        }
      );
      expect(link).toEqual(
        'http://localhost:30303/settings?email=foo%40mozilla.com&uid=123'
      );
    });
  });
  describe('buildTwoFactorSettignsLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildTwoFactorSettignsLink(
        'postConsumeRecoveryCode',
        true,
        {
          email: 'foo@mozilla.com',
        }
      );
      expect(link).toEqual(
        'http://localhost:30303/settings?utm_medium=email&utm_campaign=fx-account-consume-recovery-code&utm_content=fx-manage-two-factor&email=foo%40mozilla.com#two-step-authentication'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildTwoFactorSettignsLink(
        'postConsumeRecoveryCode',
        false,
        {
          email: 'foo@mozilla.com',
        }
      );
      expect(link).toEqual(
        'http://localhost:30303/settings?email=foo%40mozilla.com#two-step-authentication'
      );
    });
  });
  describe('buildTwoFactorSupportLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildTwoFactorSupportLink();
      expect(link).toEqual(mockConfig.twoFactorSupportUrl);
    });
  });
  describe('buildAndroidLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildAndroidLink();
      expect(link).toEqual(mockConfig.androidUrl);
    });
  });
  describe('buildIosLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildIosLink();
      expect(link).toEqual(mockConfig.iosUrl);
    });
  });

  describe('buildTermsOfServiceDownloadLink', () => {
    it('can build link', () => {
      const link = linkBuilder.buildTermsOfServiceDownloadLink(
        'downloadSubscription',
        true
      );
      expect(link).toEqual(
        `${mockConfig.subscriptionTermsUrl}?utm_medium=email&utm_content=fx-subscription-terms`
      );
    });
    it('can build link without utm', () => {
      const link = linkBuilder.buildTermsOfServiceDownloadLink(
        'downloadSubscription',
        false
      );
      expect(link).toEqual(`${mockConfig.subscriptionTermsUrl}`);
    });
  });

  describe('buildPrivacyLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildPrivacyLink('recovery', true);
      expect(link).toEqual(
        'http://localhost:3030/privacy?utm_medium=email&utm_campaign=fx-forgot-password&utm_content=fx-privacy'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildPrivacyLink('recovery', false);
      expect(link).toEqual('http://localhost:3030/privacy');
    });
  });

  describe('buildSupportLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildSupportLink('recovery', true);
      expect(link).toContain('http://localhost:3030/support');
      expect(link).toContain('utm_medium=email');
      expect(link).toContain('utm_campaign=fx-forgot-password');
      expect(link).toContain('utm_content=fx-support');
    });
  });

  describe('buildRecoveryLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildRecoveryLink('recovery', true, {
        code: '1234',
        email: 'foo@mozilla.com',
        emailToHashWith: 'foo@mozilla.com',
        redirectTo: 'https://mozilla.org',
        resume: '111',
        service: 'sync',
        token: '222',
        uid: '123',
      });

      expect(link).toEqual(
        'http://localhost:30303/complete_reset_password?utm_medium=email&utm_campaign=fx-forgot-password&utm_content=fx-reset-password&code=1234&email=foo%40mozilla.com&emailToHashWith=foo%40mozilla.com&redirectTo=https%3A%2F%2Fmozilla.org&resume=111&service=sync&token=222&uid=123'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildRecoveryLink('recovery', false, {
        code: '1234',
        email: 'foo@mozilla.com',
        emailToHashWith: 'foo@mozilla.com',
        redirectTo: 'https://mozilla.org',
        resume: '111',
        service: 'sync',
        token: '222',
        uid: '123',
      });

      expect(link).toEqual(
        'http://localhost:30303/complete_reset_password?code=1234&email=foo%40mozilla.com&emailToHashWith=foo%40mozilla.com&redirectTo=https%3A%2F%2Fmozilla.org&resume=111&service=sync&token=222&uid=123'
      );
    });
  });

  describe('buildMozillaSupportUrl', () => {
    it('can build', () => {
      const link = linkBuilder.buildMozillaSupportUrl();

      expect(link).toEqual(mockConfig.mozillaSupportUrl);
    });
  });

  describe('buildLinkAttributes', () => {
    it('can build', () => {
      const attrs = linkBuilder.buildLinkAttributes('http://mozilla.org');
      expect(attrs).toEqual(
        `href="http://mozilla.org" style="color: #0a84ff; text-decoration: none; font-family: sans-serif;"`
      );
    });
  });

  describe('buildCadLink', () => {
    it('can build', () => {
      const attrs = linkBuilder.buildCadLink('postVerify', true);
      expect(attrs).toEqual(
        'http://localhost:30303/connect_another_device?utm_medium=email&utm_campaign=fx-account-verified&utm_content=fx-account-verified'
      );
    });

    it('can build without utm', () => {
      const attrs = linkBuilder.buildCadLink('postVerify', false);
      expect(attrs).toEqual('http://localhost:30303/connect_another_device');
    });

    it('can build one click link', () => {
      const attrs = linkBuilder.buildCadLink('postVerify', true, true);
      expect(attrs).toEqual(
        'http://localhost:30303/connect_another_device?utm_medium=email&utm_campaign=fx-account-verified&utm_content=fx-account-verified-one-click&one_click=true'
      );
    });
  });

  describe('buildVerifyLoginLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildVerifyLoginLink('verifyLoginCode', true, {
        code: '1234',
        uid: '123',
        service: 'sync',
        redirectTo: 'http://mozilla.org',
        resume: '1111',
      });
      expect(link).toEqual(
        'http://test.localhost:30303/complete_signin?utm_medium=email&utm_campaign=fx-new-device-signin&utm_content=fx-new-device-signin&code=1234&uid=123&service=sync&redirectTo=http%3A%2F%2Fmozilla.org&resume=1111'
      );
    });

    it('can build without utm', () => {
      const link = linkBuilder.buildVerifyLoginLink('verifyLoginCode', false, {
        code: '1234',
        uid: '123',
        service: 'sync',
        redirectTo: 'http://mozilla.org',
        resume: '1111',
      });
      expect(link).toEqual(
        'http://test.localhost:30303/complete_signin?code=1234&uid=123&service=sync&redirectTo=http%3A%2F%2Fmozilla.org&resume=1111'
      );
    });
  });

  describe('buildVerifyShortCodeLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildVerifyShortCodeLink(
        'verifyShortCode',
        true,
        {
          email: 'foo@mozilla.com',
          uid: '123',
        }
      );

      expect(link).toEqual(
        'http://test.localhost:30303/verify_email?utm_medium=email&utm_campaign=fx-welcome&utm_content=fx-welcome&email=foo%40mozilla.com&uid=123'
      );
    });
    it('can build without utm', () => {
      const link = linkBuilder.buildVerifyShortCodeLink(
        'verifyShortCode',
        false,
        {
          email: 'foo@mozilla.com',
          uid: '123',
        }
      );
      expect(link).toEqual(
        'http://test.localhost:30303/verify_email?email=foo%40mozilla.com&uid=123'
      );
    });
  });

  describe('buildDesktopLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildDesktopLink();

      expect(link).toEqual(mockConfig.firefoxDesktopUrl);
    });
  });

  describe('buildVerifyEmailLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildVerifyEmailLink('verifyEmail', true, {
        code: 'abcd',
        uid: '123',
        redirectTo: 'http://mozilla.org',
        reminder: 'first',
        resume: 'xyz',
        service: 'sync',
      });
      expect(link).toEqual(
        'http://test.localhost:30303/verify_email?utm_medium=email&utm_campaign=fx-welcome&utm_content=fx-welcome&code=abcd&uid=123&redirectTo=http%3A%2F%2Fmozilla.org&reminder=first&resume=xyz&service=sync'
      );
    });
    it(' can build without utm', () => {
      const link = linkBuilder.buildVerifyEmailLink('verifyEmail', false, {
        code: 'abcd',
        uid: '123',
      });
      expect(link).toEqual(
        'http://test.localhost:30303/verify_email?code=abcd&uid=123'
      );
    });
  });
  describe('buildReportSigninLink', () => {
    it('can build', () => {
      const link = linkBuilder.buildReportSignInLink('verifyEmail', true, {
        uid: '123',
        unblockCode: 'abcd',
      });
      expect(link).toEqual(
        'http://localhost:30303/report_signin?utm_medium=email&utm_campaign=fx-welcome&utm_content=fx-report&uid=123&unblockCode=abcd'
      );
    });
    it('can build without utm', () => {
      const link = linkBuilder.buildReportSignInLink('verifyEmail', false, {
        uid: '123',
        unblockCode: 'abcd',
      });
      expect(link).toEqual(
        'http://localhost:30303/report_signin?uid=123&unblockCode=abcd'
      );
    });
  });
});
