/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import PromotionBanner, {
  AccountRecoveryKeyPromoBanner,
  RecoveryPhonePromoBanner,
} from '.';
import { LocationProvider } from '@reach/router';

export default {
  title: 'Components/PromotionBanner',
  component: PromotionBanner,
  subcomponents: { AccountRecoveryKeyPromoBanner, RecoveryPhonePromoBanner },
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

export const AccountRecoveryKeyPromo = () => <AccountRecoveryKeyPromoBanner />;

export const RecoveryPhonePromo = () => <RecoveryPhonePromoBanner />;
