/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { FirefoxPromoBannerView } from '.';

export default {
  title: 'Components/FirefoxPromoBanner',
  component: FirefoxPromoBannerView,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

// Desktop Firefox, signed into the browser: install Firefox on mobile via the
// pairing flow. (Signed-out Firefox and Firefox mobile show no banner.)
export const FirefoxDesktopSignedIn = () => (
  <FirefoxPromoBannerView bannerState="firefox-pair" mobileDeviceCount={0} />
);

// Non-Firefox desktop (sign-in N/A): switch to Firefox via the desktop download.
export const NonFirefoxDesktop = () => (
  <FirefoxPromoBannerView bannerState="switch-desktop" mobileDeviceCount={0} />
);

// Non-Firefox mobile (sign-in N/A): switch to Firefox via the app store.
export const NonFirefoxMobile = () => (
  <FirefoxPromoBannerView bannerState="switch-mobile" mobileDeviceCount={1} />
);
