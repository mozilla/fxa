/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  LocationProvider,
  createHistory,
  createMemorySource,
} from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_ACCOUNT, mockAppContext } from 'fxa-settings/src/models/mocks';
import { HeaderLockup } from '.';
import { Account, AppContext } from '../../../models';

export default {
  title: 'Components/Settings/HeaderLockup',
  component: HeaderLockup,
  decorators: [withLocalization],
} as Meta;

const accountWithoutAvatar = {
  avatar: {
    url: null,
    id: null,
  },
  primaryEmail: {
    email: MOCK_ACCOUNT.primaryEmail.email,
  },
} as unknown as Account;

const storyWithContext = (
  account: Partial<Account>,
  route: string = '/settings/emails'
) => {
  const context = { account: account as Account };
  const source = createMemorySource(route);
  const history = createHistory(source);

  const story = () => (
    <LocationProvider {...{ history }}>
      <AppContext.Provider value={mockAppContext(context)}>
        <HeaderLockup />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const OnSettingsPage = storyWithContext(
  accountWithoutAvatar,
  '/settings'
);
export const OnOtherPage = storyWithContext(
  accountWithoutAvatar,
  '/settings/emails'
);
export const WithCustomAvatar = storyWithContext(MOCK_ACCOUNT, '/settings');
