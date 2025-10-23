/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ResetPasswordWarning from '.';
import AppLayout from '../AppLayout';
import { createMockLocationState } from './mocks';

export default {
  title: 'Components/ResetPasswordWarning',
  component: ResetPasswordWarning,
  decorators: [withLocalization],
} as Meta;

export const NoRecoveryKeyExists = () => (
  <LocationProvider>
    <AppLayout>
      <ResetPasswordWarning locationState={createMockLocationState(false)} />
    </AppLayout>
  </LocationProvider>
);

export const RecoveryKeyExists = () => (
  <LocationProvider>
    <AppLayout>
      <ResetPasswordWarning locationState={createMockLocationState(true)} />
    </AppLayout>
  </LocationProvider>
);

export const RecoveryKeyUnkown = () => (
  <LocationProvider>
    <AppLayout>
      <ResetPasswordWarning locationState={createMockLocationState()} />
    </AppLayout>
  </LocationProvider>
);
