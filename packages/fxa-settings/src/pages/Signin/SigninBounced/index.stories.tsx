/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SigninBounced from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';

export default {
  title: 'Pages/Signin/SigninBounced',
  component: SigninBounced,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} />
  </LocationProvider>
);

export const CanGoBack = () => (
  <LocationProvider>
    <SigninBounced canGoBack email={MOCK_ACCOUNT.primaryEmail.email} />
  </LocationProvider>
);
