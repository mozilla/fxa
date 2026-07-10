/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  LegalTermsOutput,
  LegalTermsComponent,
  LegalTermsData,
  LegalTermsQueryResult,
} from './types';

export const LegalTermsOutputFactory = (
  override?: Partial<LegalTermsOutput>
): LegalTermsOutput => ({
  label: 'Mozilla Subscription Services',
  termsOfServiceLink:
    'https://www.mozilla.org/about/legal/terms/subscription-services/',
  privacyNoticeLink: 'https://www.mozilla.org/privacy/subscription-services/',
  fontSize: 'default',
  ...override,
});

export const LegalTermsComponentFactory = (
  override?: Partial<LegalTermsComponent>
): LegalTermsComponent => ({
  label: 'Mozilla Subscription Services',
  termsOfServiceLink:
    'https://www.mozilla.org/about/legal/terms/subscription-services/',
  privacyNoticeLink: 'https://www.mozilla.org/privacy/subscription-services/',
  fontSize: 'default',
  ...override,
});

export const LegalTermsDataFactory = (
  override?: Partial<LegalTermsData>
): LegalTermsData => ({
  serviceOrClientId: '9ebfe2c2f9ea3c58',
  Terms: LegalTermsComponentFactory(),
  l10nId: null,
  ...override,
});

export const LegalTermsQueryResultFactory = (
  override?: Partial<LegalTermsQueryResult>
): LegalTermsQueryResult => ({
  legalNotices: [LegalTermsDataFactory()],
  ...override,
});
