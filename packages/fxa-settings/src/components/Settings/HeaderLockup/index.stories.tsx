/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { HeaderLockup } from '.';
import { Account, AppContext } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from 'fxa-settings/src/models/mocks';

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

const storyWithContext = (account: Partial<Account>) => {
  const context = { account: account as Account };

  const story = () => (
    <AppContext.Provider value={mockAppContext(context)}>
      <HeaderLockup />
    </AppContext.Provider>
  );
  return story;
};

export const WithDefaultAvatar = storyWithContext(accountWithoutAvatar);

export const WithCustomAvatar = () => <HeaderLockup />;
