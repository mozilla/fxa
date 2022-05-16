/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { getDefault, Config } from '../../lib/config';
import { Nav } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from '../../models/mocks';
import { Account } from '../../models/Account';
import { MOCK_LINKED_ACCOUNTS } from '../LinkedAccounts/mocks';
import { Meta } from '@storybook/react';

export default {
  title: 'Components/Nav',
  component: Nav,
} as Meta;

const account = {
  primaryEmail: {
    email: 'johndope@example.com',
  },
  subscriptions: [{ created: 1, productName: 'x' }],
  linkedAccounts: [],
} as unknown as Account;

const accountWithLinkedAccounts = {
  ...account,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
};

const configWithoutNewsletterLink = {
  ...getDefault(),
  marketingEmailPreferencesUrl: '',
};

const storyWithContext = (
  account: Partial<Account>,
  storyName?: string,
  config?: Config,
) => {
  const context = config
    ? { account: account as Account, config: config }
    : { account: account as Account };

  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext(context)}>
        <Nav />
      </AppContext.Provider>
    </LocationProvider>
  );
  if (storyName) story.storyName = storyName;
  return story;
};

export const Basic = () => <Nav />;

export const WithLinkToSubscriptions = storyWithContext(
  account,
  'with link to Subscriptions'
);

export const WithLinkedAccounts = storyWithContext(
  accountWithLinkedAccounts,
  'with linked accounts'
);

export const WithoutNewsletterLink = storyWithContext(
  account,
  'without link to Newsletters',
  configWithoutNewsletterLink
);
