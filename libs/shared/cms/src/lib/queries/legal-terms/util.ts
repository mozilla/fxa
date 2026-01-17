/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LegalTermsQueryResult, LegalTermsOutput } from './types';

export class LegalTermsResultUtil {
  constructor(private rawResult: LegalTermsQueryResult) {}

  getLegalTerms(): LegalTermsOutput | null {
    const entry = this.rawResult.legalNotices[0];
    if (!entry || !entry.Terms) {
      return null; // No customization found - fallback to defaults
    }

    return {
      label: entry.Terms.label,
      termsOfServiceLink: entry.Terms.termsOfServiceLink,
      privacyNoticeLink: entry.Terms.privacyNoticeLink,
      fontSize: entry.Terms.fontSize ?? 'default',
    };
  }

  hasLegalTerms(): boolean {
    return (
      this.rawResult.legalNotices.length > 0 &&
      this.rawResult.legalNotices[0] !== null
    );
  }
}
