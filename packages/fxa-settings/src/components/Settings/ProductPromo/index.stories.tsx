/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ProductPromo, { ProductPromoProps } from '.';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Components/Settings/ProductPromo',
  component: ProductPromo,
  decorators: [withLocalization],
} as Meta<typeof ProductPromo>;

/**
 * Helper to generate a Storybook story with a mocked AppContext.
 */
function storyWithProps(props: ProductPromoProps, storyName?: string) {
  return {
    name: storyName,
    render: () => (
      <SettingsLayout>
        <ProductPromo {...props} />
      </SettingsLayout>
    ),
  };
}

// --- Generic promo: user *without* Monitor or **with** Monitor‑free but not in market eligible for special promo ----------------------------------
export const DefaultMobile = storyWithProps(
  {
    type: 'settings',
    monitorPromo: { hidePromo: false, showMonitorPlusPromo: false },
  },
  'Default Monitor promo - Banner - mobile'
);
export const DefaultDesktop = storyWithProps(
  {
    type: 'sidebar',
    monitorPromo: { hidePromo: false, showMonitorPlusPromo: false },
  },
  'Default Monitor promo - Sidebar - desktop'
);

// --- Special promo: Monitor‑free + eligible (US) ----------------------------
export const SpecialPromoMobile = storyWithProps(
  {
    type: 'settings',
    monitorPromo: { hidePromo: false, showMonitorPlusPromo: true },
  },
  'Special promo (US) - Banner - mobile'
);
export const SpecialPromoDesktop = storyWithProps(
  {
    type: 'sidebar',
    monitorPromo: { hidePromo: false, showMonitorPlusPromo: true },
  },
  'Special promo (US) - Sidebar - desktop'
);
