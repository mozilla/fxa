/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import { PagePasskeyAdd } from '.';
import { AppContext } from 'fxa-settings/src/models';
import {
  mockAppContext,
  mockSettingsContext,
} from 'fxa-settings/src/models/mocks';
import { SettingsContext } from 'fxa-settings/src/models/contexts/SettingsContext';
import { MfaContext } from '../MfaGuard';
import { getDefault } from '../../../lib/config';

export default {
  title: 'Pages/Settings/PasskeyAdd',
  component: PagePasskeyAdd,
  decorators: [withLocalization],
} as Meta;

const mockAccount = {
  getCachedJwtByScope: () => 'mock-jwt',
} as any;

// Auth client that never resolves — keeps the loading page visible.
const hangingAuthClient = {
  beginPasskeyRegistration: () => new Promise(() => {}),
  completePasskeyRegistration: () => new Promise(() => {}),
};

function initLocalAccount() {
  const NS = '__fxa_storage';
  const uid = 'abc123';
  const accounts = {
    [uid]: {
      uid,
      sessionToken: 'mock-session-token',
      email: 'user@example.com',
      verified: true,
      lastLogin: Date.now(),
    },
  };
  window.localStorage.setItem(`${NS}.accounts`, JSON.stringify(accounts));
  window.localStorage.setItem(`${NS}.currentAccountUid`, JSON.stringify(uid));
}

const configWithPasskeys = {
  ...getDefault(),
  featureFlags: {
    ...getDefault().featureFlags,
    passkeyRegistrationEnabled: true,
  },
};

export const CeremonyInProgress = () => {
  initLocalAccount();
  return (
    <LocationProvider>
      <AppContext.Provider
        value={mockAppContext({
          account: mockAccount,
          authClient: hangingAuthClient as any,
          config: configWithPasskeys,
        })}
      >
        <SettingsContext.Provider value={mockSettingsContext()}>
          <MfaContext.Provider value="passkey">
            <PagePasskeyAdd />
          </MfaContext.Provider>
        </SettingsContext.Provider>
      </AppContext.Provider>
    </LocationProvider>
  );
};
