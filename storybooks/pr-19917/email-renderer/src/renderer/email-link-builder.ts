/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const UTM_PREFIX = 'fx-';

// Campaign names for different email templates
const TEMPLATE_NAME_TO_CAMPAIGN_MAP: Record<string, string> = {
  recovery: 'forgot-password',
  passwordChanged: 'password-changed-success',
  passwordForgotOtp: 'password-forgot-otp',
  passwordReset: 'password-reset-success',
  passwordResetAccountRecovery: 'password-reset-account-recovery-success',
  passwordResetRequired: 'password-reset-required',
  newDeviceLogin: 'new-device-signin',
  postAddAccountRecovery: 'account-recovery-generated',
  postAddTwoStepAuthentication: '2fa-enabled',
  postChangePrimary: 'account-change-email',
  postConsumeRecoveryCode: 'account-consume-recovery-code',
  postNewRecoveryCodes: 'account-replace-recovery-codes',
  postRemoveAccountRecovery: 'account-recovery-removed',
  postRemoveSecondary: 'account-email-removed',
  postRemoveTwoStepAuthentication: '2fa-disabled',
  postVerify: 'account-verified',
  postVerifySecondary: 'account-email-verified',
  postAddLinkedAccount: 'account-linked',
  postAddAccountRecoveryConfirm: 'confirm-account-recovery',
  verifyEmail: 'welcome',
  verifyLoginCode: 'new-device-signin',
  verifyLogin: 'new-device-signin',
  verifyPrimary: 'welcome-primary',
  verifySecondaryCode: 'verify-secondary-email',
  verifyShortCode: 'welcome',
  unblockCode: 'new-device-signin',
  verificationReminderFirst: 'first-verification-reminder',
  verificationReminderSecond: 'second-verification-reminder',
  verificationReminderFinal: 'final-verification-reminder',
  cadReminderFirst: 'first-cad-reminder',
  cadReminderSecond: 'second-cad-reminder',
  lowRecoveryCodes: 'low-recovery-codes',
  postChangeAccountRecovery: 'post-change-account-recovery',
};

// Content names for different email templates
const TEMPLATE_NAME_TO_CONTENT_MAP: Record<string, string> = {
  recovery: 'reset-password',
  passwordChanged: 'password-change',
  passwordForgotOtp: 'password-reset',
  passwordReset: 'password-reset',
  passwordResetAccountRecovery: 'password-reset-account-recovery',
  passwordResetRequired: 'password-reset-required',
  newDeviceLogin: 'new-device-signin',
  postAddAccountRecovery: 'account-recovery-generated',
  postAddTwoStepAuthentication: '2fa-enabled',
  postChangePrimary: 'account-change-email',
  postConsumeRecoveryCode: 'account-consume-recovery-code',
  postNewRecoveryCodes: 'account-replace-recovery-codes',
  postRemoveAccountRecovery: 'account-recovery-removed',
  postRemoveSecondary: 'account-email-removed',
  postRemoveTwoStepAuthentication: '2fa-disabled',
  postVerify: 'account-verified',
  postVerifySecondary: 'account-email-verified',
  postAddLinkedAccount: 'account-linked',
  postAddAccountRecoveryConfirm: 'confirm-account-recovery',
  verifyEmail: 'welcome',
  verifyLoginCode: 'new-device-signin',
  verifyLogin: 'new-device-signin',
  verifyPrimary: 'welcome-primary',
  verifySecondaryCode: 'verify-secondary-email',
  verifyShortCode: 'welcome',
  unblockCode: 'new-device-signin',
  verificationReminderFirst: 'first-verification-reminder',
  verificationReminderSecond: 'second-verification-reminder',
  verificationReminderFinal: 'final-verification-reminder',
  cadReminderFirst: 'first-cad-reminder',
  cadReminderSecond: 'second-cad-reminder',
  lowRecoveryCodes: 'low-recovery-codes',
  postChangeAccountRecovery: 'post-change-account-recovery',
};

export interface EmailLinkBuilderConfig {
  metricsEnabled: boolean;
  initiatePasswordResetUrl: string;
  privacyUrl: string;
  supportUrl: string;
}

export class EmailLinkBuilder {
  constructor(private readonly config: EmailLinkBuilderConfig) {}

  /**
   * Common base URLs used in emails. Most often paired with UTM parameters
   * to attach tracking info.
   */
  private get urls() {
    return {
      initiatePasswordReset: this.config.initiatePasswordResetUrl,
      privacy: this.config.privacyUrl,
      support: this.config.supportUrl,
    };
  }

  /**
   * Adds UTM parameters to the provided link if metrics are enabled.
   * @param link - URL object to add parameters to
   * @param templateName - Email template name (used to lookup campaign)
   * @param metricsEnabled - Inidicates if metrics/tracking is enabled for the user
   * @param content - Optional content override (defaults to template's content map value)
   */
  private addUTMParams(
    link: URL,
    templateName: string,
    metricsEnabled: boolean,
    content?: string
  ): void {
    // Don't include utm parameters if metrics are disabled. This flag
    // comes from the users's account state and must be supplied.
    if (!metricsEnabled) {
      return;
    }

    link.searchParams.set('utm_medium', 'email');

    const campaign = this.getCampaign(templateName);
    if (campaign && !link.searchParams.has('utm_campaign')) {
      link.searchParams.set('utm_campaign', campaign);
    }

    const contentValue = content || this.getContent(templateName);
    if (contentValue) {
      link.searchParams.set('utm_content', UTM_PREFIX + contentValue);
    }
  }

  /**
   * Build common links with UTM parameters (privacy, support)
   * @param templateName
   * @param metricsEnabled - Inidicates if metrics/tracking is enabled for the user
   * @returns Object containing privacyUrl and supportUrl as strings
   */
  buildCommonLinks(templateName: string, metricsEnabled: boolean) {
    const privacyUrl = new URL(this.urls.privacy);
    const supportUrl = new URL(this.urls.support);

    this.addUTMParams(privacyUrl, templateName, metricsEnabled, 'privacy');
    this.addUTMParams(supportUrl, templateName, metricsEnabled, 'support');

    return {
      privacyUrl: privacyUrl.toString(),
      supportUrl: supportUrl.toString(),
    };
  }

  /**
   * Get the UTM campaign name for a template
   */
  private getCampaign(templateName: string): string {
    const campaign = TEMPLATE_NAME_TO_CAMPAIGN_MAP[templateName];
    // should probably have some logging/statsd if campaign is undefined
    return campaign ? UTM_PREFIX + campaign : '';
  }

  /**
   * Get the UTM content name for a template
   */
  private getContent(templateName: string): string {
    return TEMPLATE_NAME_TO_CONTENT_MAP[templateName] || '';
  }

  /**
   * Adds query parameters to the provided link; includes UTM parameters if metrics are enabled.
   * @param link - Base link string
   * @param templateName - Email template name (used to lookup campaign)
   * @param opts - Key/value pairs to add as query parameters
   * @param metricsEnabled - Inidicates if metrics/tracking is enabled for the user
   * @returns Link string with query parameters and UTM parameters (if enabled)
   */
  buildLinkWithQueryParamsAndUTM(
    link: string,
    templateName: string,
    opts: Record<string, string | undefined>,
    metricsEnabled: boolean
  ): string {
    const url = new URL(link);

    for (const [key, value] of Object.entries(opts)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
    this.addUTMParams(url, templateName, metricsEnabled);
    return url.toString();
  }

  /**
   * Builds a password change required link with email and UTM parameters.
   * @param opts
   * @returns Link to for changing user's password
   */
  buildPasswordChangeRequiredLink(
    url: string,
    email: string,
    metricsEnabled: boolean
  ): string {
    const link = new URL(url);
    this.addUTMParams(link, 'passwordResetRequired', metricsEnabled);
    link.searchParams.set('email', email);
    return link.toString();
  }

  buildInitiatePasswordResetLink(
    opts: {
      uid: string;
      token: string;
      code: string;
      email: string;
      service?: string;
      redirectTo?: string;
      resume?: string;
      emailToHashWith?: string;
    },
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.initiatePasswordReset,
      'recovery',
      opts,
      metricsEnabled
    );
  }
}
