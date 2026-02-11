/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import TermsPrivacyAgreement, { LegalTerms } from '.';
import AppLayout from '../../components/AppLayout';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/TermsPrivacyAgreement',
  component: TermsPrivacyAgreement,
  decorators: [withLocalization],
} as Meta;

const mockCustomLegalTerms: LegalTerms = {
  label: 'Custom Service Label',
  termsOfServiceLink:
    'https://www.mozilla.org/about/legal/terms/subscription-services/',
  privacyNoticeLink: 'https://www.mozilla.org/privacy/subscription-services/',
  fontSize: 'default',
};

export const Default = () => (
  <AppLayout>
    <TermsPrivacyAgreement />
  </AppLayout>
);

export const WithCustomTerms = () => (
  <AppLayout>
    <TermsPrivacyAgreement legalTerms={mockCustomLegalTerms} />
  </AppLayout>
);

export const FontSize1Default = () => (
  <AppLayout>
    <TermsPrivacyAgreement
      legalTerms={{
        ...mockCustomLegalTerms,
        fontSize: 'default',
      }}
    />
  </AppLayout>
);

export const FontSize2Medium = () => (
  <AppLayout>
    <TermsPrivacyAgreement
      legalTerms={{
        ...mockCustomLegalTerms,
        fontSize: 'medium',
      }}
    />
  </AppLayout>
);

export const FontSize3Large = () => (
  <AppLayout>
    <TermsPrivacyAgreement
      legalTerms={{
        ...mockCustomLegalTerms,
        fontSize: 'large',
      }}
    />
  </AppLayout>
);
