/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey from '.';
import { PasskeyRowData } from '../SubRow';
import { AppContext } from 'fxa-settings/src/models';
import { MOCK_ACCOUNT, mockAppContext } from 'fxa-settings/src/models/mocks';
import { initLocalAccount, mockAuthClient } from '../SubRow/mock';

export default {
  title: 'Components/Settings/UnitRowPasskey',
  component: UnitRowPasskey,
  decorators: [withLocalization],
} as Meta;

const mockPasskeys: PasskeyRowData[] = [
  {
    credentialId: 'passkey-1',
    name: 'MacBook Pro',
    createdAt: new Date('2026-01-01').getTime(),
    lastUsedAt: new Date('2026-02-01').getTime(),
    prfEnabled: false,
  },
  {
    credentialId: 'passkey-2',
    name: 'iPhone 15',
    createdAt: new Date('2025-12-01').getTime(),
    lastUsedAt: new Date('2026-01-31').getTime(),
    prfEnabled: true,
  },
  {
    credentialId: 'passkey-3',
    name: 'Work Laptop',
    createdAt: new Date('2025-11-01').getTime(),
    lastUsedAt: null,
    prfEnabled: false,
  },
];

const storyWithPasskeys = (passkeys: PasskeyRowData[]) => {
  const story = () => {
    initLocalAccount();
    const mockAccount = {
      ...MOCK_ACCOUNT,
      passkeys,
      deletePasskey: async () => {},
    };
    return (
      <LocationProvider>
        <AppContext.Provider
          value={mockAppContext({
            authClient: mockAuthClient,
            account: mockAccount,
          } as any)}
        >
          <UnitRowPasskey />
        </AppContext.Provider>
      </LocationProvider>
    );
  };
  return story;
};

export const NoPasskeys = storyWithPasskeys([]);

export const SinglePasskey = storyWithPasskeys([mockPasskeys[0]]);

export const WithNeverUsedPasskey = storyWithPasskeys([mockPasskeys[2]]);

export const MultiplePasskeys = storyWithPasskeys(mockPasskeys);

export const AtMaxPasskeys = storyWithPasskeys(
  Array.from({ length: 10 }, (_, i) => ({
    credentialId: `passkey-${i + 1}`,
    name: `Passkey ${i + 1}`,
    createdAt: new Date('2026-01-01').getTime(),
    lastUsedAt: new Date('2026-02-01').getTime(),
    prfEnabled: i % 2 === 0,
  }))
);
