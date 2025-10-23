/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { PageRecentActivity } from '.';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { MOCK_SECURITY_EVENTS } from './mocks';

export default {
  title: 'Pages/Settings/RecentActivity',
  component: PageRecentActivity,
  decorators: [withLocalization],
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
