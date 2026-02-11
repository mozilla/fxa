/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface LegalTermsComponent {
  label: string;
  termsOfServiceLink: string;
  privacyNoticeLink: string;
  fontSize: 'default' | 'medium' | 'large' | null;
}

export interface LegalTermsData {
  serviceOrClientId: string;
  Terms: LegalTermsComponent;
  l10nId: string | null;
}

export interface LegalTermsQueryResult {
  legalNotices: (LegalTermsData | null)[];
}

// Simplified result type for frontend consumption
export interface LegalTermsOutput {
  label: string;
  termsOfServiceLink: string;
  privacyNoticeLink: string;
  fontSize: 'default' | 'medium' | 'large';
}
