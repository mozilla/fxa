/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { Security } from '.';
import { Account } from '../../../models/Account';

export default {
  title: 'Components/Settings/Security',
  component: Security,
  decorators: [withLocalization],
} as Meta;

const storyWithAccount = (account: Partial<Account>, storyName?: string) => {
  const story = () => (
    <LocationProvider>
      <AppContext.Provider
        value={mockAppContext({ account: account as Account })}
      >
        <Security />
      </AppContext.Provider>
    </LocationProvider>
  );
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
  'Account recovery key set and two factor enabled'
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
  'Third party auth, no password set'
);
