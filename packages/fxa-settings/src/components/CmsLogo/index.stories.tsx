/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import CmsLogo from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/CmsLogo',
  component: CmsLogo,
  decorators: [
    withLocalization,
    (Story) => (
      <div className="flex flex-col gap-4 p-10 max-w-lg">
        <Story />
      </div>
    ),
  ],
} as Meta;

// Sample logo data for stories
const mockMozillaLogo = {
  logoUrl: 'https://gist.githubusercontent.com/dschom/857ebb2abd5f75937f211f1fd6bbf9a8/raw/33037c8905757a594e07eb29818d8519447fdec0/nightly-logo.svg',
  logoAltText: 'Mozilla',
};

const mockFirefoxLogo = {
  logoUrl: 'https://gist.githubusercontent.com/dschom/c754b76333cda59f50845fe9b0ff6d52/raw/157b0af53142b24e0ddae936c711c010428e7bba/foxy-logo.svg',
  logoAltText: 'Firefox',
};

export const DesktopLeftAligned = () => (
  <CmsLogo
    isMobile={false}
    logoPosition="left"
    logos={[mockMozillaLogo]}
  />
);

export const DesktopCenterAligned = () => (
  <CmsLogo
    isMobile={false}
    logoPosition="center"
    logos={[mockMozillaLogo]}
  />
);

export const MobileHidden = () => (
  <CmsLogo
    isMobile={true}
    logoPosition="left"
    logos={[mockMozillaLogo]}
  />
);

export const NoLogo = () => (
  <CmsLogo
    isMobile={false}
    logoPosition="left"
    logos={[]}
  />
);

export const InvalidLogo = () => (
  <CmsLogo
    isMobile={false}
    logoPosition="left"
    logos={[{ logoUrl: undefined, logoAltText: undefined }]}
  />
);

export const MultipleLogos = () => (
  <CmsLogo
    isMobile={false}
    logoPosition="center"
    logos={[
      { logoUrl: undefined, logoAltText: undefined }, // Invalid logo (will be skipped)
      mockFirefoxLogo, // This should be used
      mockMozillaLogo, // This will be ignored (first valid logo is used)
    ]}
  />
);

export const FirefoxLogo = () => (
  <CmsLogo
    isMobile={false}
    logoPosition="center"
    logos={[mockFirefoxLogo]}
  />
);

export const Comparison = () => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-4">Left Aligned (Desktop)</h3>
      <CmsLogo
        isMobile={false}
        logoPosition="left"
        logos={[mockMozillaLogo]}
      />
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Center Aligned (Desktop)</h3>
      <CmsLogo
        isMobile={false}
        logoPosition="center"
        logos={[mockMozillaLogo]}
      />
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Mobile (Hidden)</h3>
      <p className="text-sm text-gray-600 mb-2">Logo is hidden on mobile devices</p>
      <CmsLogo
        isMobile={true}
        logoPosition="left"
        logos={[mockMozillaLogo]}
      />
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">No Logo</h3>
      <p className="text-sm text-gray-600 mb-2">When no valid logo is provided</p>
      <CmsLogo
        isMobile={false}
        logoPosition="center"
        logos={[]}
      />
    </div>
  </div>
);
