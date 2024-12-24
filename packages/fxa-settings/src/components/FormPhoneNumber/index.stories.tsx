/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormPhoneNumber from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import AppLayout from '../AppLayout';

export default {
  title: 'Components/FormPhoneNumber',
  component: FormPhoneNumber,
  decorators: [
    (Story) => (
      <AppLayout>
        <Story />
      </AppLayout>
    ),
    withLocalization,
  ],
} as Meta;

const mockSubmit = async (phoneNumber: string) => {
  action('submitPhoneNumber')(phoneNumber);
  return { hasErrors: false };
};

export const Default = () => (
  <FormPhoneNumber
    localizedCTAText="Send code"
    submitPhoneNumber={mockSubmit}
  />
);

export const WithError = () => (
  <FormPhoneNumber
    localizedCTAText="Send code"
    submitPhoneNumber={async () => {
      action('submitPhoneNumber')();
      return { hasErrors: true };
    }}
  />
);

export const WithInfoBanner = () => (
  <FormPhoneNumber
    infoBannerContent={{
      localizedDescription: 'This is a description',
      localizedHeading: 'This is a heading',
    }}
    infoBannerLink={{
      localizedText: 'This is a link',
      path: '#',
    }}
    localizedCTAText="Confirm"
    submitPhoneNumber={mockSubmit}
  />
);
