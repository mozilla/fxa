/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SignupConfirmed from '.';
import { MozServices } from '../../../lib/types';
import { createMockIntegrationWithCms } from '../../mocks';

export default {
  title: 'Pages/Signup/SignupConfirmed',
  component: SignupConfirmed,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignedIn = () => (
  <LocationProvider>
    <SignupConfirmed isSignedIn />
  </LocationProvider>
);

export const DefaultSignedOut = () => (
  <LocationProvider>
    <SignupConfirmed isSignedIn={false} />
  </LocationProvider>
);

export const IsSync = () => (
  <LocationProvider>
    <SignupConfirmed isSignedIn={false} serviceName={MozServices.FirefoxSync} />
  </LocationProvider>
);

export const IsSyncWithCms = () => (
  <LocationProvider>
    <SignupConfirmed
      isSignedIn={false}
      serviceName={MozServices.FirefoxSync}
      integration={createMockIntegrationWithCms()}
    />
  </LocationProvider>
);
