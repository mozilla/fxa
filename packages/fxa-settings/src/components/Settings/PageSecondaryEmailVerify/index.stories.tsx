/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta, StoryObj } from '@storybook/react';
import { PageSecondaryEmailVerify } from '.';
import { MemoryRouter } from 'react-router';
// Location state is now read internally via useLocation()
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { AppContext } from '../../../models/contexts/AppContext';
import { mockAppContext } from '../../../models/mocks';
import { MfaContext } from '../MfaGuard';

export default {
  title: 'Pages/Settings/SecondaryEmailVerify',
  component: PageSecondaryEmailVerify,
  decorators: [withLocalization],
} as Meta;

const initialEntries = [{ pathname: '/', state: { email: 'johndope@example.com' } }];

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
    <MemoryRouter initialEntries={initialEntries}>
      <AppContext.Provider value={SuccessAppCtx}>
        <SettingsLayout>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailVerify />
          </MfaContext.Provider>
        </SettingsLayout>
      </AppContext.Provider>
    </MemoryRouter>
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
    <MemoryRouter initialEntries={initialEntries}>
      <AppContext.Provider value={ErrorAppCtx}>
        <SettingsLayout>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailVerify />
          </MfaContext.Provider>
        </SettingsLayout>
      </AppContext.Provider>
    </MemoryRouter>
  ),
};

const ErrorBlockedAppCtx = mockAppContext({
  account: {
    ...mockAppContext().account,
    loading: false,
    resendSecondaryEmailCodeWithJwt: async () => {
      const err: any = { errno: 125 };
      throw err;
    },
    verifySecondaryEmail: async () => Promise.resolve(),
  } as any,
});

export const ResendErrorBlocked: Story = {
  render: () => (
    <MemoryRouter initialEntries={initialEntries}>
      <AppContext.Provider value={ErrorBlockedAppCtx}>
        <SettingsLayout>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailVerify />
          </MfaContext.Provider>
        </SettingsLayout>
      </AppContext.Provider>
    </MemoryRouter>
  ),
};
