/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ProductPromo, { ProductPromoProps, ProductPromoType } from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Settings/ProductPromo',
  component: ProductPromo,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: ProductPromoProps, storyName?: string) => {
  const story = () => <ProductPromo {...props} />;

  if (storyName) story.storyName = storyName;
  return story;
};

export const MonitorFreeSettings = storyWithProps(
  { type: ProductPromoType.Settings },
  'MonitorFree promo (Settings, mobile only, resize window)'
);

export const MonitorFreeSidebar = storyWithProps(
  { type: ProductPromoType.Sidebar },
  'MonitorFree promo (Sidebar, resize window)'
);

export const MonitorPlusSettings = storyWithProps(
  { type: ProductPromoType.Settings, showMonitorPlusPromo: true },
  'MonitorPlus promo (Settings, mobile only, resize window)'
);

export const MonitorPlusSidebar = storyWithProps(
  { type: ProductPromoType.Sidebar, showMonitorPlusPromo: true },
  'MonitorPlus promo (Sidebar, resize window)'
);
