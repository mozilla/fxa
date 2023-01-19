/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PageRecentActivity } from '.';
import { MOCK_SECURITY_EVENTS } from './mocks';
import { Meta } from '@storybook/react';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';

export default {
  title: 'pages/Settings/RecentActivity',
  component: PageRecentActivity,
} as Meta;

export const Default = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        getSecurityEvents: () => Promise.resolve(MOCK_SECURITY_EVENTS),
      } as any,
    })}
  >
    <PageRecentActivity />
  </AppContext.Provider>
);

export const NoEvents = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: { getSecurityEvents: () => Promise.resolve([]) } as any,
    })}
  >
    <PageRecentActivity />
  </AppContext.Provider>
);
