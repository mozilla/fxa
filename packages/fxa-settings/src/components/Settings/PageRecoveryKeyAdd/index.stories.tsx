/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PageRecoveryKeyAdd } from '.';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Account, AppContext } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';

export default {
  title: 'Pages/Settings/RecoveryKeyAdd',
  component: PageRecoveryKeyAdd,
  decorators: [withLocalization],
} as Meta;

const randomKey = crypto.getRandomValues(new Uint8Array(20));

const account = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => Promise.resolve(randomKey),
} as unknown as Account;

export const DefaultWithAnyPassword = () => (
  <LocationProvider>
    <AppContext.Provider value={mockAppContext({ account })}>
      <AppLayout>
        <PageRecoveryKeyAdd />
      </AppLayout>
    </AppContext.Provider>
  </LocationProvider>
);
