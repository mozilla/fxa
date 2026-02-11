/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey, { Passkey } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { initLocalAccount, mockAuthClient } from '../SubRow/mock';

export default {
  title: 'Components/Settings/UnitRowPasskey',
  component: UnitRowPasskey,
  decorators: [withLocalization],
} as Meta;

const mockPasskeys = [
  {
    id: 'passkey-1',
    name: 'MacBook Pro',
    createdAt: new Date('2026-01-01').getTime(),
    lastUsed: new Date('2026-02-01').getTime(),
    canSync: false,
  },
  {
    id: 'passkey-2',
    name: 'iPhone 15',
    createdAt: new Date('2025-12-01').getTime(),
    lastUsed: new Date('2026-01-31').getTime(),
    canSync: true,
  },
  {
    id: 'passkey-3',
    name: 'Work Laptop',
    createdAt: new Date('2025-11-01').getTime(),
    lastUsed: undefined,
    canSync: false,
  },
];

const storyWithPasskeys = (passkeys: Passkey[]) => {
  const story = () => {
    initLocalAccount();
    return (
      <LocationProvider>
        <AppContext.Provider
          value={mockAppContext({ authClient: mockAuthClient } as any)}
        >
          <UnitRowPasskey passkeys={passkeys} />
        </AppContext.Provider>
      </LocationProvider>
    );
  };
  return story;
};

export const NoPasskeys = storyWithPasskeys([]);

export const WithPasskeys = storyWithPasskeys(mockPasskeys);

export const SinglePasskey = storyWithPasskeys([mockPasskeys[0]]);

export const WithNeverUsedPasskey = storyWithPasskeys([mockPasskeys[2]]);

export const MultiplePasskeys = storyWithPasskeys(mockPasskeys);
