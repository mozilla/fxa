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

export const SettingsWithMonitor = storyWithProps(
  { type: ProductPromoType.Settings },
  'Settings with Monitor (resize window)'
);
export const SidebarWithMonitor = storyWithProps(
  { type: ProductPromoType.Sidebar },
  'Sidebar with Monitor (resize window)'
);
