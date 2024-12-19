/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormPhoneNumber from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';

export default {
  title: 'Components/FormPhoneNumber',
  component: FormPhoneNumber,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <FormPhoneNumber localizedCTAText="Send code" />
  </AppLayout>
);

export const WithInfo = () => (
  <AppLayout>
    <FormPhoneNumber showInfo localizedCTAText="Confirm" />
  </AppLayout>
);
