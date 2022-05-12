/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { mockSession } from '../../models/mocks';
import { getDefault } from '../../lib/config';
import { Nav } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { MOCK_LINKED_ACCOUNTS } from '../LinkedAccounts/mocks';

const account = {
  primaryEmail: {
    email: 'johndope@example.com',
  },
  subscriptions: [{ created: 1, productName: 'x' }],
  linkedAccounts: [],
} as any;
const accountWithLinkedAccounts = Object.assign({}, account, {
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
});

storiesOf('Components/Nav', module)
  .add('basic', () => <Nav />)
  .add('with link to Subscriptions', () => (
    <AppContext.Provider value={{ account, session: mockSession() }}>
      <Nav />
    </AppContext.Provider>
  ))
  .add('with linked accounts', () => (
    <AppContext.Provider
      value={{ account: accountWithLinkedAccounts, session: mockSession() }}
    >
      <Nav />
    </AppContext.Provider>
  ))
  .add('without link to Newsletters', () => {
    const config = Object.assign({}, getDefault(), {
      marketingEmailPreferencesUrl: '',
    });

    return (
      <AppContext.Provider value={{ account, session: mockSession(), config }}>
        <Nav />
      </AppContext.Provider>
    );
  });
