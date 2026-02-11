/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LegalTerms from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { fetchLegalDoc } from '../mocks';

export default {
  title: 'Pages/Legal/Terms',
  component: LegalTerms,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => <LegalTerms {...{ fetchLegalDoc }} />;

export const WithError = () => (
  <LegalTerms
    fetchLegalDoc={() =>
      Promise.resolve({ error: 'Failed to fetch terms of service' })
    }
  />
);
