/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import AlternativeAuthOptions, { AlternativeAuthOptionsProps } from '.';
import Banner from '../Banner';
import { AppContext } from '../../models';
import { mockAppContext } from '../../models/mocks';

export const Subject = (props: AlternativeAuthOptionsProps) => (
  <AppContext.Provider value={mockAppContext()}>
    <LocationProvider>
      <AlternativeAuthOptions {...props} />
    </LocationProvider>
  </AppContext.Provider>
);

export const PasskeyErrorBannerFixture = () => (
  <Banner
    type="error"
    content={{
      localizedHeading: 'Sign-in failed',
      localizedDescription:
        'We couldn’t verify your passkey. Please try again or sign in with your password.',
    }}
  />
);
