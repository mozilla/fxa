/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninBounced from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import { MOCK_ACCOUNT } from '../../../models/mocks';

export default {
  title: 'Pages/Signin/SigninBounced',
  component: SigninBounced,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <SigninBounced
      emailLookupComplete
      email={MOCK_ACCOUNT.primaryEmail.email}
    />
  </LocationProvider>
);

export const CanGoBack = () => (
  <LocationProvider>
    <SigninBounced
      canGoBack
      emailLookupComplete
      email={MOCK_ACCOUNT.primaryEmail.email}
    />
  </LocationProvider>
);
