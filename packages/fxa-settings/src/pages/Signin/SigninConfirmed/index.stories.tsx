/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninConfirmed from '.';
import { MemoryRouter } from 'react-router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MozServices } from '../../../lib/types';
import { createMockSigninOAuthIntegration, MOCK_CMS_INFO } from '../mocks';

export default {
  title: 'Pages/Signin/SigninConfirmed',
  component: SigninConfirmed,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignedIn = () => (
  <MemoryRouter>
    <SigninConfirmed isSignedIn />
  </MemoryRouter>
);

export const DefaultSignedOut = () => (
  <MemoryRouter>
    <SigninConfirmed isSignedIn={false} />
  </MemoryRouter>
);

export const IsSync = () => (
  <MemoryRouter>
    <SigninConfirmed isSignedIn={false} serviceName={MozServices.FirefoxSync} />
  </MemoryRouter>
);

export const IsSyncWithCms = () => (
  <MemoryRouter>
    <SigninConfirmed
      isSignedIn={false}
      serviceName={MozServices.FirefoxSync}
      integration={
        createMockSigninOAuthIntegration({
          cmsInfo: MOCK_CMS_INFO,
        }) as any
      }
    />
  </MemoryRouter>
);
