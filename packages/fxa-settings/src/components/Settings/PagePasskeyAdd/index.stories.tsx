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
import { Security } from '../Security';
import { getDefault } from '../../../lib/config';
import { Account } from '../../../models/Account';

export default {
  title: 'Pages/Settings/PasskeyAdd',
  component: PagePasskeyAdd,
  decorators: [withLocalization],
} as Meta;

const mockAccount = {
  getCachedJwtByScope: () => 'mock-jwt',
} as any;

// Auth client that never resolves — keeps the ceremony modal visible.
const hangingAuthClient = {
  beginPasskeyRegistration: () => new Promise(() => {}),
  completePasskeyRegistration: () => new Promise(() => {}),
  listPasskeys: () =>
    Promise.resolve([
      {
        credentialId: 'passkey-1',
        name: 'MacBook Pro',
        createdAt: new Date('2026-01-01').getTime(),
        lastUsedAt: new Date('2026-02-01').getTime(),
        transports: ['internal'],
        aaguid: 'aaguid-1',
        backupEligible: false,
        backupState: false,
        prfEnabled: false,
      },
    ]),
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

const securityAccount = {
  recoveryKey: { exists: true },
  totp: { verified: true, exists: true },
  hasPassword: true,
  passwordCreated: 1651860173938,
  backupCodes: { hasBackupCodes: true, count: 5 },
  recoveryPhone: {
    exists: true,
    phoneNumber: '+15551234567',
    nationalFormat: '(555) 123-4567',
    available: true,
  },
} as unknown as Account;

// Shows the ceremony-in-progress modal overlaid on the Security section,
// matching what the user sees after clicking "Create" from the Passkeys row.
export const CeremonyInProgress = () => {
  initLocalAccount();
  return (
    <LocationProvider>
      <AppContext.Provider
        value={mockAppContext({
          account: { ...securityAccount, ...mockAccount } as any,
          authClient: hangingAuthClient as any,
          config: configWithPasskeys,
        })}
      >
        <SettingsContext.Provider value={mockSettingsContext()}>
          <Security />
          <MfaContext.Provider value="passkey">
            <PagePasskeyAdd />
          </MfaContext.Provider>
        </SettingsContext.Provider>
      </AppContext.Provider>
    </LocationProvider>
  );
};
