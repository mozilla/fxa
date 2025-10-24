/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import ProductPromo, { ProductPromoProps } from '.';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Components/Settings/ProductPromo',
  component: ProductPromo,
  decorators: [withLocalization, withLocation('/settings')],
} as Meta<typeof ProductPromo>;

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

export const MobilePromo = storyWithProps(
  {
    type: 'settings',
    monitorPromo: { hidePromo: false },
  },
  'Monitor promo - Banner - mobile only'
);
export const DesktopPromo = storyWithProps(
  {
    type: 'sidebar',
    monitorPromo: { hidePromo: false },
  },
  'Monitor promo - Sidebar - desktop'
);
