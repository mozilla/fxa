/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface Page {
  headline: string | null;
  description: string | null;
  primaryButtonText: string | null;
  logoUrl: string | null;
  logoAltText: string | null;
  pageTitle: string | null;
}

export interface Email {
  subject: string;
  headline: string;
  description: string;
}

export interface Shared {
  buttonColor: string | null;
  logoUrl: string | null;
  logoAltText: string | null;
  emailFromName: string | null;
  emailLogoUrl: string | null;
  emailLogoAltText: string | null;
  emailLogoWidth: string | null;
  backgroundColor: string | null;
  pageTitle: string | null;
  headerLogoUrl: string | null;
  headerLogoAltText: string | null;
  featureFlags: FeatureFlags | null;
  favicon: string | null;
}

export interface FeatureFlags {
  syncConfirmedPageHideCTA: boolean | null;
  syncHidePromoAfterLogin: boolean | null;
}

export interface RelyingPartyResult {
  clientId: string | null;
  entrypoint: string | null;
  name: string | null;
  l10nId: string;
  EmailFirstPage?: Page;
  SignupSetPasswordPage?: Page;
  SignupConfirmCodePage?: Page;
  SignupConfirmedSyncPage?: Page;
  SigninPage?: Page;
  SigninTokenCodePage?: Page;
  SigninUnblockCodePage?: Page;
  shared?: Shared;
  NewDeviceLoginEmail?: Email;
  VerifyLoginCodeEmail?: Email;
  VerifyShortCodeEmail?: Email;
}
