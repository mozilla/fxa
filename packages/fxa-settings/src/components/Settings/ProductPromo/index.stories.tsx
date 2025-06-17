/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ProductPromo, { ProductPromoProps } from '.';
import SettingsLayout from '../SettingsLayout';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';

export default {
  title: 'Components/Settings/ProductPromo',
  component: ProductPromo,
  decorators: [withLocalization],
} as Meta<typeof ProductPromo>;

/**
 * Helper to generate a Storybook story with a mocked AppContext.
 */
function storyWithProps(
  props: ProductPromoProps,
  account: Account,
  storyName?: string
) {
  return {
    name: storyName,
    render: () => (
      <AppContext.Provider
        value={mockAppContext({
          account,
        })}
      >
        <SettingsLayout>
          <ProductPromo {...props} />
        </SettingsLayout>
      </AppContext.Provider>
    ),
  };
}

// Convenience account presets
const noMonitor = {
  attachedClients: [],
  subscriptions: [],
} as unknown as Account;
const monitorFree = {
  attachedClients: [{ name: MozServices.Monitor }],
  subscriptions: [],
} as unknown as Account;
const monitorPlus = {
  attachedClients: [{ name: MozServices.Monitor }],
  subscriptions: [{ productName: MozServices.MonitorPlus }],
} as unknown as Account;

// --- Generic promo: user *without* Monitor or **with** Monitor‑free but not in market eligible for special promo ----------------------------------
export const DefaultMobile = storyWithProps(
  { type: 'settings' },
  noMonitor,
  'Default Monitor promo - Banner - mobile'
);
export const DefaultDesktop = storyWithProps(
  { type: 'sidebar' },
  noMonitor,
  'Default Monitor promo - Sidebar - desktop'
);

// --- Special promo: Monitor‑free + eligible (US) ----------------------------
export const SpecialPromoMobile = storyWithProps(
  { type: 'settings', specialPromoEligible: true },
  monitorFree,
  'Special promo (US) - Banner - mobile'
);
export const SpecialPromoDesktop = storyWithProps(
  { type: 'sidebar', specialPromoEligible: true },
  monitorFree,
  'Special promo (US) - Sidebar - desktop'
);

// --- Hidden state: Monitor Plus subscribers --------------------------------
export const NoPromo = storyWithProps(
  {},
  monitorPlus,
  'No Promo | existing Monitor Plus user'
);
