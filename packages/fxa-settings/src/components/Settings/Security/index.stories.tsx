/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { Security } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { Account } from '../../../models/Account';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

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
});

export const SecurityFeaturesEnabled = storyWithAccount(
  {
    recoveryKey: { exists: true },
    totp: { verified: true, exists: true },
    hasPassword: true,
    passwordCreated: 1651860173938,
  },
  'Account recovery key set and two factor enabled'
);

export const NoPassword = storyWithAccount(
  {
    recoveryKey: { exists: false },
    totp: { verified: false, exists: false },
    hasPassword: false,
  },
  'Third party auth, no password set'
);
