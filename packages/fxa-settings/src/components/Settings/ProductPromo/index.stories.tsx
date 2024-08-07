/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ProductPromo, { ProductPromoProps, ProductPromoType } from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';

export default {
  title: 'Components/Settings/ProductPromo',
  component: ProductPromo,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (
  props: ProductPromoProps,
  account: any,
  storyName?: string
) => {
  const story = () => (
    <AppContext.Provider
      value={mockAppContext({
        account,
      })}
    >
      <ProductPromo {...props} />
    </AppContext.Provider>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const SettingsWithMonitor = storyWithProps(
  { type: ProductPromoType.Settings },
  {
    attachedClients: [{ name: MozServices.Monitor }],
    subscriptions: [],
  },
  'Settings with Monitor (resize window)'
);
export const SidebarWithMonitor = storyWithProps(
  { type: ProductPromoType.Sidebar },
  {
    attachedClients: [{ name: MozServices.Monitor }],
    subscriptions: [],
  },
  'Sidebar with Monitor (resize window)'
);
export const SidebarWithNoMonitor = storyWithProps(
  { type: ProductPromoType.Sidebar },
  {
    attachedClients: [],
    subscriptions: [],
  },
  'Sidebar with no Monitor'
);
export const SidebarWithMonitorNoPlus = storyWithProps(
  { type: ProductPromoType.Sidebar },
  {
    attachedClients: [{ name: MozServices.Monitor }],
    subscriptions: [],
  },
  'Sidebar with Monitor no Plus'
);
export const SidebarWithMonitorPlus = storyWithProps(
  { type: ProductPromoType.Sidebar },
  {
    attachedClients: [{ name: MozServices.Monitor }],
    subscriptions: [{ productName: MozServices.MonitorPlus }],
  },
  'Sidebar with Monitor with Plus'
);
