/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import parser from 'accept-language-parser';

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
  passwordResetUrl: string;
  privacyUrl: string;
  supportUrl: string;
  accountSettingsUrl: string;
  verificationUrl: string;
  verifyLoginUrl: string;
  prependVerificationSubdomain: {
    enabled: boolean;
    subdomain: string;
  };
  verifyPrimaryEmailUrl: string;
  syncUrl: string;
}

export type RecoveryLinkQueryParams = {
  uid: string;
  token: string;
  code: string;
  email: string;
  resume: string;
  emailToHashWith: string;
  service?: string;
  redirectTo?: string;
};

type OAuthLinkParams = {
  service?: string;
  redirectTo?: string;
  resume?: string;
};

export class EmailLinkBuilder {
  constructor(private readonly config: EmailLinkBuilderConfig) {}

  /**
   * Common base URLs used in emails. Most often paired with UTM parameters
   * to attach tracking info.
   */
  public get urls() {
    return {
      initiatePasswordReset: this.config.initiatePasswordResetUrl,
      completePasswordReset: this.config.passwordResetUrl,
      privacy: this.config.privacyUrl,
      support: this.config.supportUrl,
      accountSettings: this.config.accountSettingsUrl,
      verificationUrl: this.config.verificationUrl,
      verification: this.config.verificationUrl,
      verifyLogin: this.config.verifyLoginUrl,
      verifyPrimaryEmail: this.config.verifyPrimaryEmailUrl,
      syncUrl: this.config.syncUrl,
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

  buildRevokeAccountRecoveryLink(): string {
    throw new Error('TBD');
  }

  buildLowRecoveryCodesLink(): string {
    throw new Error('TBD');
  }

  buildPostNewRecoveryCodesLink(): string {
    throw new Error('TBD');
  }

  buildTwoFactorSettignsLink(): string {
    throw new Error('TBD');
  }

  buildTwoFactorSupportLink(): string {
    throw new Error('TBD');
  }

  buildAndroidLink(): string {
    throw new Error('TBD');
  }

  buildIosLink(): string {
    throw new Error('TBD');
  }

  buildTermsOfServiceDownloadLink(opts: { metricsEnabled: boolean }) {
    throw new Error('TBD');
  }

  buildDefaultSurveyLink() {
    throw new Error('TBD');
    // const defaultSureyUrl = 'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21';
  }

  buildPrivacyNoticeDownloadLink() {
    throw new Error('TBD');
  }

  buildCancellationSurveyLink() {
    throw new Error('TBD');
  }

  buildPrivacyLink(templateName: string, metricsEnabled: boolean) {
    const privacyUrl = new URL(this.urls.privacy);
    this.addUTMParams(privacyUrl, templateName, metricsEnabled, 'privacy');
    return privacyUrl.toString();
  }

  buildSupportLink(templateName: string, metricsEnabled: boolean) {
    const supportUrl = new URL(this.urls.support);
    this.addUTMParams(supportUrl, templateName, metricsEnabled, 'support');
    return supportUrl.toString();
  }

  buildRecoveryLink(
    templateName: 'recovery',
    metricsEnabled: boolean,
    queryParams: RecoveryLinkQueryParams
  ): string {
    const url = new URL(this.urls.completePasswordReset);
    this.addUTMParams(url, templateName, metricsEnabled);
    Object.entries(queryParams).forEach((x) => {
      const [k, v] = x;
      if (v) {
        url.searchParams.set(k, v);
      }
    });
    return url.toString();
  }

  buildMozillaSupportUrl(templateName: string, metricsEnabled: boolean) {
    const mozillaSupportUrl = new URL('https://support.mozilla.org');
    this.addUTMParams(mozillaSupportUrl, templateName, metricsEnabled);
    return mozillaSupportUrl.toString();
  }

  /**
   * Deprecated - Build links one at a time suing buildLink calls
   * Build common links with UTM parameters (privacy, support)
   * @param templateName
   * @param metricsEnabled - Inidicates if metrics/tracking is enabled for the user
   * @returns Object containing privacyUrl and supportUrl as strings
   */
  buildCommonLinks(templateName: string, metricsEnabled: boolean) {
    return {
      privacyUrl: this.buildPrivacyLink(templateName, metricsEnabled),
      supportUrl: this.buildSupportLink(templateName, metricsEnabled),
      mozillaSupportUrl: this.buildMozillaSupportUrl(
        templateName,
        metricsEnabled
      ),
    };
  }

  buildPrimaryLink(
    templateName: string,
    metricsEnabled: boolean,
    opts: {
      to: string;
      uid: string;
    },
    primaryLink?: string
  ): string {
    // Create the URL and fill out query params
    const url = new URL(primaryLink || this.urls.accountSettings);

    url.searchParams.set('email', opts.to);
    url.searchParams.set('uid', opts.uid);

    this.addUTMParams(url, templateName, metricsEnabled);

    // Special case for verification subdomains. Locally these are disabled, but in
    // other environmetns this will likely kick in!
    if (
      primaryLink === this.config.verificationUrl ||
      primaryLink === this.config.verifyLoginUrl
    ) {
      url.host = `${this.config.prependVerificationSubdomain.subdomain}.${url.host}`;
    }

    return url.toString();
  }

  /**
   * Creates HTML link attributes to be written into document
   * @param link The href link value
   * @returns A set of attributes that can be placed in an <a>
   */
  buildLinkAttributes(link: string) {
    return `href="${link}" style="color: #0a84ff; text-decoration: none; font-family: sans-serif;"`;
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
    metricsEnabled: boolean,
    content?: string
  ): string {
    const url = new URL(link);

    for (const [key, value] of Object.entries(opts)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
    this.addUTMParams(url, templateName, metricsEnabled, content);
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

  /**
   * Builds a password reset link
   * @param email Users email
   * @param metricsEnabled If user has metrics enabled
   * @returns A link to initiate a password reset
   */
  buildResetLink(
    templateName: string,
    email: string,
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.initiatePasswordReset,
      templateName,
      {
        email,
      },
      metricsEnabled,
      'reset-password'
    );
  }
  buildInitiatePasswordResetLink(
    opts: OAuthLinkParams & {
      uid: string;
      token: string;
      code: string;
      email: string;
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

  buildVerifyEmailLink(
    opts: OAuthLinkParams & {
      code: string;
      style?: string;
      uid: string;
    },
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.verification,
      'verify',
      opts,
      metricsEnabled
    );
  }

  /**
   * Link for the verifyLogin email template
   * @param opts
   * @param metricsEnabled
   * @returns
   */
  buildVerifyLoginLink(
    opts: OAuthLinkParams & {
      uid: string;
      code: string;
    },
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.verifyLogin,
      'verifyLogin',
      opts,
      metricsEnabled
    );
  }

  /**
   * Builds the passwordChangeLink, which is shared and used across multiple email templates.
   * @param opts
   * @param metricsEnabled
   * @param templateName
   * @returns
   */
  buildPasswordChangeLink(
    opts: OAuthLinkParams & {
      uid?: string;
      code?: string;
    },
    metricsEnabled: boolean,
    templateName: string
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.initiatePasswordReset,
      templateName,
      {
        // do not use spread so callers have easier ability to
        // pass in their full options object
        service: opts.service,
        redirectTo: opts.redirectTo,
        resume: opts.resume,
        uid: opts.uid,
        code: opts.code,
      },
      metricsEnabled
    );
  }

  /**
   * Builds the verify primary email link. `primary_email_verified` param
   * should be the email address being verified.
   * @param opts
   * @param metricsEnabled
   */
  buildVerifyPrimaryEmailLink(
    opts: OAuthLinkParams & {
      uid: string;
      code: string;
      primary_email_verified: string;
    },
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.verifyPrimaryEmail,
      'verifyPrimary',
      { ...opts, type: 'primary' },
      metricsEnabled
    );
  }

  buildPostVerifyLink(metricsEnabled: boolean): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.syncUrl,
      'postVerify',
      {}, // no extra params needed
      metricsEnabled
    );
  }

  /**
   * Builds a password change url with UTM parameters.
   *
   * If an email is provided in opts, it will be added as a query parameter. Used for
   * `passwordChangeRequired` email.
   * @param opts
   * @param metricsEnabled
   * @returns
   */
  buildPasswordResetLink(
    opts: { email?: string },
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.initiatePasswordReset,
      'passwordReset',
      opts,
      metricsEnabled
    );
  }

  buildUnblockCodeLink(
    opts: {
      uid: string;
      unblockCode: string;
      email: string;
    },
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.verifyLogin,
      'unblockCode',
      opts,
      metricsEnabled
    );
  }

  buildVerifyLoginCodeLink(
    opts: OAuthLinkParams & {
      uid: string;
      code: string;
    },
    metricsEnabled: boolean
  ): string {
    return this.buildLinkWithQueryParamsAndUTM(
      this.urls.verifyLogin,
      'verifyLoginCode',
      opts,
      metricsEnabled
    );
  }
}

// PORTED FROM fxa-shared/subscriptions/configuration/utils.ts
const DEFAULT_LOCALE = 'en';
export const localizedPlanConfig = (
  planConfig: Readonly<{
    uiContent: Record<string, any>;
    urls: Record<string, string>;
    support: Record<string, string>;
    locales?: {
      [key: string]: {
        uiContent?: Record<string, any>;
        urls?: Record<string, string>;
        support?: Record<string, string>;
      };
    };
  }>,
  userLocales: string[]
) => {
  const planConfigLocales = Object.keys(planConfig.locales || {});
  const defaults = {
    uiContent: planConfig.uiContent,
    urls: planConfig.urls,
    support: planConfig.support,
  };

  if (!planConfigLocales.length || !userLocales.length) {
    return defaults;
  }
  if (!planConfigLocales.includes(DEFAULT_LOCALE)) {
    planConfigLocales.push(DEFAULT_LOCALE);
  }

  const pickedLang = parser.pick(planConfigLocales, userLocales.join(','));

  if (
    pickedLang &&
    pickedLang !== DEFAULT_LOCALE &&
    planConfig.locales &&
    planConfig.locales[pickedLang]
  ) {
    const localizedConfigs = planConfig.locales[pickedLang];

    return {
      uiContent: { ...defaults.uiContent, ...localizedConfigs.uiContent },
      urls: { ...defaults.urls, ...localizedConfigs.urls },
      support: { ...defaults.support, ...localizedConfigs.support },
    };
  }

  return defaults;
};
