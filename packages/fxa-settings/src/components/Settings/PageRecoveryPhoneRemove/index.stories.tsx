/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import PageRecoveryPhoneRemove from '.';
import { LocationProvider } from '@reach/router';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';

export default {
  title: 'Pages/Settings/RecoveryPhoneRemove',
  component: PageRecoveryPhoneRemove,
  decorators: [withLocalization],
} as Meta;

const account = {
  ...MOCK_ACCOUNT,
  recoveryPhone: {
    exists: true,
    phoneNumber: '123-456-7890',
    available: true,
  },
  removeRecoveryPhone: () => true,
} as unknown as Account;

export const Default = () => (
  <AppContext.Provider
    value={mockAppContext({
      account,
    })}
  >
    <LocationProvider>
      <PageRecoveryPhoneRemove />
    </LocationProvider>
  </AppContext.Provider>
);
