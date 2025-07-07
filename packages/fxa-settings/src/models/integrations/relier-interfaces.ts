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

export interface PageRelierCmsInfo {
  headline: string | undefined;
  description: string | undefined;
  primaryButtonText: string | undefined;
}

export interface SharedRelierCmsInfo {
  buttonColor: string | undefined;
  logoUrl: string | undefined;
  logoAltText: string | undefined;
}

export interface RelierCmsInfo {
  name: string;
  clientId: string;
  entrypoint: string;
  shared?: SharedRelierCmsInfo;

  EmailFirstPage?: PageRelierCmsInfo

  SignupSetPasswordPage?: PageRelierCmsInfo
  SignupConfirmCodePage?: PageRelierCmsInfo
  SignupConfirmedSyncPage?: PageRelierCmsInfo

  SigninPage?: PageRelierCmsInfo
  SigninTotpCodePage?: PageRelierCmsInfo
  SigninTokenCodePage?: PageRelierCmsInfo
  SigninUnblockCodePage?: PageRelierCmsInfo
}
