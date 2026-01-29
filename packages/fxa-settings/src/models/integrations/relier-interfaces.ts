/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface RelierClientInfo {
  clientId: string | undefined;
  imageUri: string | undefined;
  serviceName: string | undefined;
  redirectUri: string | undefined;
  trusted: boolean | undefined;
}

export interface RelierSubscriptionInfo {
  subscriptionProductId: string;
  subscriptionProductName: string;
}

export interface RelierAccount {
  uid: string;
  email: string;
  sessionToken: string;
  verifyIdToken(
    idTokenHint: string,
    clientId: string,
    gracePeriod: number
  ): Promise<{ sub: string }>;
  isDefault(): boolean;
}

/**
 * Allowed font sizes for CMS-customizable headlines.
 * Maps to Tailwind CSS font size utilities and Strapi enum values.
 *
 * The values match the Strapi GraphQL enum Enum_Componentaccountsshared_Headlinefontsize.
 *
 * - `default`: text-xl (22px)
 * - `medium`: text-xxl (28px)
 * - `large`: text-xxxl (32px)
 */
export type HeadlineFontSize = 'default' | 'medium' | 'large';

export interface PageRelierCmsInfo {
  headline: string;
  description: string | undefined;
  primaryButtonText: string;
  pageTitle?: string | undefined;
  primaryImage?: {
    url: string;
    altText: string;
  } | null;
  splitLayout?: boolean | undefined;
}

export interface PageRelierCmsInfoWithLogo extends PageRelierCmsInfo {
  logoUrl: string | undefined;
  logoAltText: string | undefined;
}

export interface SharedBackgroundsRelierCmsInfo {
  defaultLayout?: string | undefined;
  header?: string | undefined;
  splitLayout?: string | undefined;
  splitLayoutAltText?: string | undefined;
}

export interface SharedRelierCmsInfo {
  buttonColor: string | undefined;
  logoUrl: string | undefined;
  logoAltText: string | undefined;
  backgrounds?: SharedBackgroundsRelierCmsInfo;
  pageTitle?: string | undefined;
  headerLogoUrl?: string | undefined;
  headerLogoAltText?: string | undefined;
  featureFlags?: FeatureFlagsRelierCmsInfo | undefined;
  favicon?: string | undefined;
  headlineFontSize?: HeadlineFontSize | null;
  headlineTextColor?: string | null;
  additionalAccessibilityInfo?: string | undefined;
}

export interface FeatureFlagsRelierCmsInfo {
  syncConfirmedPageHideCTA?: boolean | undefined;
  syncHidePromoAfterLogin?: boolean | undefined;
}

export interface RelierLegalTerms {
  label: string;
  termsOfServiceLink: string;
  privacyNoticeLink: string;
  fontSize: 'default' | 'medium' | 'large';
}

export interface RelierCmsInfo {
  name: string;
  clientId: string;
  entrypoint: string;
  shared: SharedRelierCmsInfo;

  EmailFirstPage: PageRelierCmsInfoWithLogo;

  SignupSetPasswordPage: PageRelierCmsInfoWithLogo;
  SignupConfirmCodePage: PageRelierCmsInfo;
  SignupConfirmedSyncPage?: PageRelierCmsInfo;

  SigninPage: PageRelierCmsInfo;
  SigninTotpCodePage?: PageRelierCmsInfo;
  SigninTokenCodePage?: PageRelierCmsInfo;
  SigninUnblockCodePage?: PageRelierCmsInfo;
}
