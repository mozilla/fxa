/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowTwoStepAuth from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

export default {
  title: 'Components/Settings/UnitRowTwoStepAuth',
  component: UnitRowTwoStepAuth,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        {/* Added to represent the section in which rows are nested */}
        <div className="bg-white tablet:rounded-xl shadow">
          <Story />
        </div>
      </LocationProvider>
    ),
  ],
} as Meta;

export const TFAEnabledWithCodesRemaining = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: true,
        totp: { exists: true, verified: true },
        backupCodes: { hasBackupCodes: true, count: 3 },
      } as any,
    })}
  >
    <UnitRowTwoStepAuth />
  </AppContext.Provider>
);

export const TFAEnabledNoCodesRemaining = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: true,
        totp: { exists: true, verified: true },
        backupCodes: { hasBackupCodes: false, count: 0 },
      } as any,
    })}
  >
    <UnitRowTwoStepAuth />
  </AppContext.Provider>
);

export const TFADisabled = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: true,
        totp: { exists: false, verified: false },
        backupCodes: { count: 0 },
      } as any,
    })}
  >
    <UnitRowTwoStepAuth />
  </AppContext.Provider>
);

export const DisabledNoPassword = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: false,
        totp: { enabled: false },
        backupCodes: { count: 0 },
      } as any,
    })}
  >
    <UnitRowTwoStepAuth />
  </AppContext.Provider>
);
