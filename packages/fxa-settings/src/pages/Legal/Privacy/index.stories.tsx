/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LegalPrivacy from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { fetchLegalDoc } from '../mocks';

export default {
  title: 'Pages/Legal/Privacy',
  component: LegalPrivacy,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => <LegalPrivacy {...{ fetchLegalDoc }} />;

export const WithError = () => (
  <LegalPrivacy
    fetchLegalDoc={() =>
      Promise.resolve({ error: 'Failed to fetch privacy notice' })
    }
  />
);
