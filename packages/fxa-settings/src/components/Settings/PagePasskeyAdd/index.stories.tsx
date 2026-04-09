/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import { PagePasskeyAdd } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { MfaContext } from '../MfaGuard';

export default {
  title: 'Components/Settings/PagePasskeyAdd',
  component: PagePasskeyAdd,
  decorators: [withLocalization],
} as Meta;

// Mock auth client that never resolves (shows loading state indefinitely)
const hangingAuthClient = {
  beginPasskeyRegistration: () => new Promise(() => {}),
  completePasskeyRegistration: () => new Promise(() => {}),
};

const mockAccount = {
  getCachedJwtByScope: () => 'mock-jwt',
} as any;

export const Loading = () => (
  <LocationProvider>
    <AppContext.Provider
      value={mockAppContext({
        account: mockAccount,
        authClient: hangingAuthClient as any,
      })}
    >
      <MfaContext.Provider value="passkey">
        <PagePasskeyAdd />
      </MfaContext.Provider>
    </AppContext.Provider>
  </LocationProvider>
);
