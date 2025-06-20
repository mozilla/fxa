/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface Page {
  headline: string | null;
  description: string | null;
  primaryButtonText: string | null;
}

export interface Shared {
  buttonColor: string | null;
  logoUrl: string | null;
  logoAltText: string | null;
}

export interface RelyingPartyResult {
  clientId: string | null;
  entrypoint: string | null;
  name: string | null;
  EmailFirstPage?: Page;
  SignupSetPasswordPage?: Page;
  SignupConfirmCodePage?: Page;
  SignupConfirmedSyncPage?: Page;
  Shared?: Shared;
}