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
  prependVerificationSubdomain: {
    enabled: boolean;
    subdomain: string;
  };

  /** Url for the front end. e.g. https://accounts.firefox.com */
  baseUri: string;

  defaultSurveyUrl: string;
  subscriptionTermsUrl: string;
  androidUrl: string;
  iosUrl: string;
  supportUrl: string;
  subscriptionSupportUrl: string;
  privacyUrl: string;
  twoFactorSupportUrl: string;
  mozillaSupportUrl: string;
  firefoxDesktopUrl: string;
}

export type RecoveryLinkQueryParams =
  | {
      uid: string;
      token: string;
      code: string;
      email: string;
      resume: string;
      emailToHashWith: string;
    }
  | {
      uid: string;
      token: string;
      code: string;
      email: string;
      resume: string;
      emailToHashWith: string;
      service: string;
      redirectTo: string;
    };

export class EmailLinkBuilder {
  constructor(private readonly config: EmailLinkBuilderConfig) {}

  /**
   * Common base URLs used in emails. Most often paired with UTM parameters
   * to attach tracking info.
   */
  public get urls() {
    return {
      privacy: this.config.privacyUrl,
      support: this.config.supportUrl,
    };
  }

  private get baseUri() {
    return this.config.baseUri;
  }

  /**
   * Adds UTM parameters to the provided link if metrics are enabled.
   * @param link - URL object to add parameters to
   * @param templateName - Email template name (used to lookup campaign)
   * @param metricsEnabled - Inidicates if metrics/tracking is enabled for the user
   * @param content - Optional content override (defaults to template's content map value)
   * @param oneClickLink - Indicates if this should be a one-click link, adding a suffix to the utm_content value
   */
  private addUTMParams(
    url: URL,
    templateName: string,
    metricsEnabled: boolean,
    content?: string,
    oneClickLink = false
  ): void {
    // Don't include utm parameters if metrics are disabled. This flag
    // comes from the users's account state and must be supplied.
    if (!metricsEnabled) {
      return;
    }

    const hash = url.hash;

    url.searchParams.set('utm_medium', 'email');

    const campaign = this.getCampaign(templateName);
    if (campaign && !url.searchParams.has('utm_campaign')) {
      url.searchParams.set('utm_campaign', campaign);
    }

    const contentValue = content || this.getContent(templateName);
    if (contentValue && oneClickLink) {
      url.searchParams.set(
        'utm_content',
        UTM_PREFIX + contentValue + '-one-click'
      );
      url.searchParams.set('one_click', 'true');
    } else if (contentValue) {
      url.searchParams.set('utm_content', UTM_PREFIX + contentValue);
    }

    url.hash = hash; // restore hash!
  }

  private addQueryParams(url: URL, query: Record<string, string>) {
    const hash = url.hash;
    Object.entries(query).forEach(([k, v]) => {
      if (v) {
        url.searchParams.set(k, v);
      }
    });

    if (hash) {
      url.hash = hash;
    }
  }

  buildPasswordChangeLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      email: string;
    }
  ): string {
    const url = new URL(`${this.baseUri}/settings/change_password`);
    this.addUTMParams(url, templateName, metricsEnabled, 'change-password');
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildRevokeAccountRecoveryLink(
    templateName: string,
    metricsEnabled: boolean
  ): string {
    const url = new URL(`${this.baseUri}/settings#recovery-key`);
    this.addUTMParams(url, templateName, metricsEnabled, 'report');
    return url.toString();
  }

  buildLowRecoveryCodesLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      email: string;
      uid: string;
    }
  ): string {
    const url = new URL(
      `${this.baseUri}/settings/two_step_authentication/replace_codes`
    );
    this.addUTMParams(url, templateName, metricsEnabled);
    this.addQueryParams(url, {
      low_recovery_codes: 'true',
      ...query,
    });

    return url.toString();
  }

  buildPostNewRecoveryCodesLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      email: string;
      uid: string;
    }
  ): string {
    const url = new URL(`${this.baseUri}/settings`);
    this.addUTMParams(url, templateName, metricsEnabled);
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildTwoFactorSettignsLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      email: string;
    }
  ): string {
    const url = new URL(`${this.baseUri}/settings#two-step-authentication`);
    this.addUTMParams(url, templateName, metricsEnabled, 'manage-two-factor');
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildTwoFactorSupportLink(): string {
    return this.config.twoFactorSupportUrl;
  }

  buildAndroidLink(): string {
    return this.config.androidUrl;
  }

  buildIosLink(): string {
    return this.config.iosUrl;
  }

  buildTermsOfServiceDownloadLink(
    templateName: string,
    metricsEnabled: boolean
  ) {
    const url = new URL(this.config.subscriptionTermsUrl);
    this.addUTMParams(url, templateName, metricsEnabled, 'subscription-terms');
    return url.toString();
  }

  buildPrivacyLink(templateName: string, metricsEnabled: boolean) {
    const privacyUrl = new URL(this.config.privacyUrl);
    this.addUTMParams(privacyUrl, templateName, metricsEnabled, 'privacy');
    return privacyUrl.toString();
  }

  buildSupportLink(templateName: string, metricsEnabled: boolean) {
    const supportUrl = new URL(this.config.supportUrl);
    this.addUTMParams(supportUrl, templateName, metricsEnabled, 'support');
    return supportUrl.toString();
  }

  buildRecoveryLink(
    templateName: 'recovery',
    metricsEnabled: boolean,
    query: RecoveryLinkQueryParams
  ): string {
    const url = new URL(`${this.baseUri}/complete_reset_password`);
    this.addUTMParams(url, templateName, metricsEnabled);
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildMozillaSupportUrl() {
    return this.config.mozillaSupportUrl;
  }

  buildAccountSettingsLink(
    templateName: string,
    metricsEnabled: boolean,
    query: { email?: string; uid?: string }
  ) {
    const url = new URL(`${this.baseUri}/settings`);
    this.addUTMParams(url, templateName, metricsEnabled);
    this.addQueryParams(url, query);
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
   * Builds a password change required link with email and UTM parameters.
   * @param opts
   * @returns Link to for changing user's password
   */
  buildPasswordChangeRequiredLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      email: string;
    }
  ): string {
    const url = new URL(`${this.baseUri}/settings/change_password`);
    this.addUTMParams(url, templateName, metricsEnabled, 'change-password');
    this.addQueryParams(url, query);
    return url.toString();
  }

  /**
   * Builds a password reset link
   * @param email Users email
   * @param metricsEnabled If user has metrics enabled
   * @returns A link to initiate a password reset
   */
  buildResetLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      email: string;
    }
  ): string {
    const url = new URL(`${this.baseUri}/reset_password`);
    this.addUTMParams(url, templateName, metricsEnabled, 'reset-password');
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildCadLink(
    templateName: string,
    metricsEnabled: boolean,
    oneClickLink = false
  ) {
    const url = new URL(`${this.baseUri}/connect_another_device`);
    this.addUTMParams(
      url,
      templateName,
      metricsEnabled,
      undefined,
      oneClickLink
    );
    return url.toString();
  }

  buildVerifyLoginLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      code: string;
      uid: string;
      service?: string;
      redirectTo?: string;
      resume?: string;
    }
  ) {
    const url = new URL(`${this.baseUri}/complete_signin`);
    if (this.config.prependVerificationSubdomain.enabled) {
      url.host = `${this.config.prependVerificationSubdomain.subdomain}.${url.host}`;
    }
    this.addUTMParams(url, templateName, metricsEnabled);
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildVerifyShortCodeLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      email?: string;
      uid?: string;
    }
  ) {
    const url = new URL(`${this.baseUri}/verify_email`);
    if (this.config.prependVerificationSubdomain.enabled) {
      url.host = `${this.config.prependVerificationSubdomain.subdomain}.${url.host}`;
    }
    this.addUTMParams(url, templateName, metricsEnabled);
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildDesktopLink() {
    return this.config.firefoxDesktopUrl;
  }

  buildVerifyEmailLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      code: string;
      uid: string;
      resume?: string;
      redirectTo?: string;
      service?: string;
      reminder?: 'first' | 'second' | 'final';
    }
  ): string {
    const url = new URL(`${this.baseUri}/verify_email`);
    if (this.config.prependVerificationSubdomain.enabled) {
      url.host = `${this.config.prependVerificationSubdomain.subdomain}.${url.host}`;
    }
    this.addUTMParams(url, templateName, metricsEnabled);
    this.addQueryParams(url, query);
    return url.toString();
  }

  buildReportSignInLink(
    templateName: string,
    metricsEnabled: boolean,
    query: {
      uid: string;
      unblockCode: string;
    }
  ): string {
    const url = new URL(`${this.baseUri}/report_signin`);
    this.addUTMParams(url, templateName, metricsEnabled, 'report');
    this.addQueryParams(url, query);
    return url.toString();
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
