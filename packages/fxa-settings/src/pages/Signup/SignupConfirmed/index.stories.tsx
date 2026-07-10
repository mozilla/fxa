/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SignupConfirmed from '.';
import { MemoryRouter } from 'react-router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MozServices } from '../../../lib/types';
import { createMockIntegrationWithCms } from '../../mocks';

export default {
  title: 'Pages/Signup/SignupConfirmed',
  component: SignupConfirmed,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignedIn = () => (
  <MemoryRouter>
    <SignupConfirmed isSignedIn />
  </MemoryRouter>
);

export const DefaultSignedOut = () => (
  <MemoryRouter>
    <SignupConfirmed isSignedIn={false} />
  </MemoryRouter>
);

export const IsSync = () => (
  <MemoryRouter>
    <SignupConfirmed isSignedIn={false} serviceName={MozServices.FirefoxSync} />
  </MemoryRouter>
);

export const IsSyncWithCms = () => (
  <MemoryRouter>
    <SignupConfirmed
      isSignedIn={false}
      serviceName={MozServices.FirefoxSync}
      integration={createMockIntegrationWithCms()}
    />
  </MemoryRouter>
);
