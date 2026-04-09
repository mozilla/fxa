/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { Passkey } from 'fxa-auth-client/browser';

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

const storyWithMockPasskeys = (passkeys: Passkey[]) => {
  const authClient = {
    listPasskeys: () => Promise.resolve(passkeys),
  };
  const story = () => (
    <LocationProvider>
      <AppContext.Provider
        value={mockAppContext({ authClient: authClient as any })}
      >
        <UnitRowPasskey />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const NoPasskeys = storyWithMockPasskeys([]);

export const WithPasskeys = storyWithMockPasskeys(mockPasskeys);

export const SinglePasskey = storyWithMockPasskeys([mockPasskeys[0]]);
