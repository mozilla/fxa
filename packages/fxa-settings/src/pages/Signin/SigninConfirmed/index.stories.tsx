/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SigninConfirmed from '.';
import { MozServices } from '../../../lib/types';
import { createMockSigninOAuthIntegration, MOCK_CMS_INFO } from '../mocks';

export default {
  title: 'Pages/Signin/SigninConfirmed',
  component: SigninConfirmed,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignedIn = () => (
  <LocationProvider>
    <SigninConfirmed isSignedIn />
  </LocationProvider>
);

export const DefaultSignedOut = () => (
  <LocationProvider>
    <SigninConfirmed isSignedIn={false} />
  </LocationProvider>
);

export const IsSync = () => (
  <LocationProvider>
    <SigninConfirmed isSignedIn={false} serviceName={MozServices.FirefoxSync} />
  </LocationProvider>
);

export const IsSyncWithCms = () => (
  <LocationProvider>
    <SigninConfirmed
      isSignedIn={false}
      serviceName={MozServices.FirefoxSync}
      integration={
        createMockSigninOAuthIntegration({
          cmsInfo: MOCK_CMS_INFO,
        }) as any
      }
    />
  </LocationProvider>
);
