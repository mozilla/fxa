/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PageSecondaryEmailVerify } from '.';
import { WindowLocation, LocationProvider } from '@reach/router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { AppContext } from '../../../models/contexts/AppContext';
import { mockAppContext } from '../../../models/mocks';

export default {
  title: 'Pages/Settings/SecondaryEmailVerify',
  component: PageSecondaryEmailVerify,
  decorators: [withLocalization],
} as Meta;

const mockLocation = {
  state: { email: 'johndope@example.com' },
} as unknown as WindowLocation;

type Story = StoryObj<typeof PageSecondaryEmailVerify>;

const SuccessAppCtx = mockAppContext({
  account: {
    ...mockAppContext().account,
    loading: false,
    resendSecondaryEmailCodeWithJwt: async () => Promise.resolve(),
    verifySecondaryEmail: async () => Promise.resolve(),
  } as any,
});

export const ResendSuccess: Story = {
  render: () => (
    <LocationProvider>
      <AppContext.Provider value={SuccessAppCtx}>
        <SettingsLayout>
          <PageSecondaryEmailVerify location={mockLocation} />
        </SettingsLayout>
      </AppContext.Provider>
    </LocationProvider>
  ),
};

const ErrorAppCtx = mockAppContext({
  account: {
    ...mockAppContext().account,
    loading: false,
    resendSecondaryEmailCodeWithJwt: async () => {
      const err: any = { errno: 114, retryAfterLocalized: '5 minutes' };
      throw err;
    },
    verifySecondaryEmail: async () => Promise.resolve(),
  } as any,
});

export const ResendError: Story = {
  render: () => (
    <LocationProvider>
      <AppContext.Provider value={ErrorAppCtx}>
        <SettingsLayout>
          <PageSecondaryEmailVerify location={mockLocation} />
        </SettingsLayout>
      </AppContext.Provider>
    </LocationProvider>
  ),
};
