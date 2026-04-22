/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { Security } from '.';
import { AppContext } from 'fxa-settings/src/models';
import {
  mockAppContext,
  mockSettingsContext,
} from 'fxa-settings/src/models/mocks';
import { SettingsContext } from 'fxa-settings/src/models/contexts/SettingsContext';
import { Account } from '../../../models/Account';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { getDefault } from '../../../lib/config';

export default {
  title: 'Components/Settings/Security',
  component: Security,
  decorators: [withLocalization],
} as Meta;

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

const mockPasskeys = [
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
  {
    credentialId: 'passkey-2',
    name: 'iPhone 15',
    createdAt: new Date('2025-12-01').getTime(),
    lastUsedAt: new Date('2026-01-31').getTime(),
    transports: ['internal', 'hybrid'],
    aaguid: 'aaguid-2',
    backupEligible: true,
    backupState: true,
    prfEnabled: false,
  },
];

const storyWithAccount = (
  account: Partial<Account>,
  options?: {
    storyName?: string;
    passkeys?: boolean;
    authClientOverrides?: Record<string, any>;
  }
) => {
  const { storyName, passkeys, authClientOverrides } = options || {};
  const authClient = passkeys
    ? {
        listPasskeys: () => Promise.resolve(mockPasskeys),
        ...authClientOverrides,
      }
    : {};

  const story = () => {
    if (passkeys) initLocalAccount();
    return (
      <LocationProvider>
        <AppContext.Provider
          value={mockAppContext({
            account: account as Account,
            ...(passkeys && {
              config: configWithPasskeys,
              authClient: authClient as any,
            }),
          })}
        >
          <SettingsContext.Provider value={mockSettingsContext()}>
            <Security />
          </SettingsContext.Provider>
        </AppContext.Provider>
      </LocationProvider>
    );
  };
  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithAccount({
  recoveryKey: { exists: false },
  totp: { exists: false, verified: false },
  hasPassword: true,
  passwordCreated: 1651860173938,
  backupCodes: {
    hasBackupCodes: false,
  },
  recoveryPhone: {
    exists: false,
    phoneNumber: null,
    nationalFormat: null,
    available: true,
  },
});

export const SecurityFeaturesEnabled = storyWithAccount(
  {
    recoveryKey: { exists: true },
    totp: { verified: true, exists: true },
    hasPassword: true,
    passwordCreated: 1651860173938,
    backupCodes: {
      hasBackupCodes: true,
      count: 5,
    },
    recoveryPhone: {
      exists: true,
      phoneNumber: '+1234567890',
      nationalFormat: '123-456-7890',
      available: true,
    },
  },
  { storyName: 'Account recovery key set and two factor enabled' }
);

export const NoPassword = storyWithAccount(
  {
    recoveryKey: { exists: false },
    totp: { verified: false, exists: false },
    hasPassword: false,
    backupCodes: {
      hasBackupCodes: false,
    },
  },
  { storyName: 'Third party auth, no password set' }
);

export const WithPasskeys = storyWithAccount(
  {
    recoveryKey: { exists: true },
    totp: { verified: true, exists: true },
    hasPassword: true,
    passwordCreated: 1651860173938,
    backupCodes: {
      hasBackupCodes: true,
      count: 5,
    },
    recoveryPhone: {
      exists: true,
      phoneNumber: '+1234567890',
      nationalFormat: '123-456-7890',
      available: true,
    },
  },
  { storyName: 'All security features with passkeys enabled', passkeys: true }
);

export const WithPasskeysNoOtherMfa = storyWithAccount(
  {
    recoveryKey: { exists: false },
    totp: { exists: false, verified: false },
    hasPassword: true,
    passwordCreated: 1651860173938,
    backupCodes: {
      hasBackupCodes: false,
    },
    recoveryPhone: {
      exists: false,
      phoneNumber: null,
      nationalFormat: null,
      available: true,
    },
  },
  { storyName: 'Passkeys enabled, no other MFA', passkeys: true }
);

export const WithPasskeysEmpty = storyWithAccount(
  {
    recoveryKey: { exists: false },
    totp: { exists: false, verified: false },
    hasPassword: true,
    passwordCreated: 1651860173938,
    backupCodes: {
      hasBackupCodes: false,
    },
  },
  {
    storyName: 'Passkeys enabled but none registered',
    passkeys: true,
    authClientOverrides: { listPasskeys: () => Promise.resolve([]) },
  }
);
