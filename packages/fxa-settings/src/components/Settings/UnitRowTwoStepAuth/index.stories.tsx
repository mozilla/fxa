/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowTwoStepAuth from '.';
import { Account, AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { action } from '@storybook/addon-actions';

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
      } as unknown as Account,
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
      } as unknown as Account,
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
      } as unknown as Account,
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
      } as unknown as Account,
    })}
  >
    <UnitRowTwoStepAuth />
  </AppContext.Provider>
);

export const TwoFAEnabledWithBackupCodesNoBackupPhone = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: true,
        totp: { exists: true, verified: true },
        backupCodes: { hasBackupCodes: true, count: 3 },
      } as unknown as Account,
    })}
  >
    <UnitRowTwoStepAuth
      backupPhoneSubRowProps={{ onCtaClick: () => action('Add clicked') }}
    />
  </AppContext.Provider>
);

export const TwoFAEnabledWithBackupPhoneNoBackupCodes = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: true,
        totp: { exists: true, verified: true },
        backupCodes: { hasBackupCodes: false, count: 0 },
      } as unknown as Account,
    })}
  >
    <UnitRowTwoStepAuth
      backupPhoneSubRowProps={{
        phoneNumber: '555-555-1234',
        onCtaClick: () => action('Change clicked'),
      }}
    />
  </AppContext.Provider>
);

export const TwoFAEnabledWithBackupCodesAndBackupPhone = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: true,
        totp: { exists: true, verified: true },
        backupCodes: { hasBackupCodes: true, count: 3 },
      } as unknown as Account,
    })}
  >
    <UnitRowTwoStepAuth
      backupPhoneSubRowProps={{
        phoneNumber: '555-555-1234',
        onCtaClick: () => action('Change clicked'),
        onDeleteClick: () => action('Delete clicked'),
        showDescription: true,
      }}
    />
  </AppContext.Provider>
);

// if backup codes run out and user does not replace them
export const TwoFAEnabledNoBackupCodesNoBackupPhone = () => (
  <AppContext.Provider
    value={mockAppContext({
      account: {
        hasPassword: true,
        totp: { exists: true, verified: true },
        backupCodes: { hasBackupCodes: false, count: 0 },
      } as unknown as Account,
    })}
  >
    <UnitRowTwoStepAuth
      backupPhoneSubRowProps={{
        onCtaClick: () => action('Add clicked'),
      }}
    />
  </AppContext.Provider>
);
