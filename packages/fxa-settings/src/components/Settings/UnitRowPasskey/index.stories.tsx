/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey from '.';
import { Account, AppContext } from 'fxa-settings/src/models';
import {
  MOCK_ACCOUNT,
  mockAppContext,
  mockSettingsContext,
} from 'fxa-settings/src/models/mocks';
import { SettingsContext } from 'fxa-settings/src/models/contexts/SettingsContext';
import { Passkey } from 'fxa-auth-client/browser';

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

export default {
  title: 'Components/Settings/UnitRowPasskey',
  component: UnitRowPasskey,
  decorators: [withLocalization],
} as Meta;

const mockPasskeys: Passkey[] = [
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

const storyWithMockPasskeys = (
  passkeys: Passkey[],
  { webAuthnSupported = true }: { webAuthnSupported?: boolean } = {}
) => {
  const story = () => {
    initLocalAccount();
    // Stub the WebAuthn Level 3 feature check for storybook previews.
    const w = window as any;
    if (webAuthnSupported) {
      w.PublicKeyCredential = {
        ...(w.PublicKeyCredential || {}),
        parseCreationOptionsFromJSON: () => ({}),
        parseRequestOptionsFromJSON: () => ({}),
      };
    } else {
      delete w.PublicKeyCredential;
    }
    const mockAccount = {
      ...MOCK_ACCOUNT,
      passkeys,
      deletePasskey: async () => {},
    };
    return (
      <LocationProvider>
        <AppContext.Provider
          value={mockAppContext({
            account: mockAccount as unknown as Account,
          })}
        >
          <SettingsContext.Provider value={mockSettingsContext()}>
            <UnitRowPasskey />
          </SettingsContext.Provider>
        </AppContext.Provider>
      </LocationProvider>
    );
  };
  return story;
};

export const NoPasskeys = storyWithMockPasskeys([]);

export const SinglePasskey = storyWithMockPasskeys([mockPasskeys[0]]);

export const MultiplePasskeys = storyWithMockPasskeys(mockPasskeys);

export const AtMaxPasskeys = storyWithMockPasskeys(
  Array.from({ length: 10 }, (_, i) => ({
    credentialId: `passkey-${i + 1}`,
    name: `Passkey ${i + 1}`,
    createdAt: new Date('2026-01-01').getTime(),
    lastUsedAt: new Date('2026-02-01').getTime(),
    transports: ['internal'] as string[],
    aaguid: `aaguid-${i + 1}`,
    backupEligible: i % 2 === 0,
    backupState: false,
    prfEnabled: false,
  }))
);

export const WebAuthnNotSupported = storyWithMockPasskeys([], {
  webAuthnSupported: false,
});
