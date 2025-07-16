/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Account } from '../../../models/Account';
import AuthClient from 'fxa-auth-client/browser';

import { PageSettings } from '.';
import { Config } from '../../../lib/config';

import { LocationProvider } from '@reach/router';
import { mockAppContext } from '../../../models/mocks';
import { AppContext } from 'fxa-settings/src/models';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import {
  accountEligibleForRecoveryKey,
  accountEligibleForRecoveryPhoneOnly,
  coldStartAccount,
  completelyFilledOutAccount,
  partiallyFilledOutAccount,
} from './mocks';

export default {
  title: 'Pages/Settings',
  component: PageSettings,
  decorators: [withLocalization],
} as Meta;

const mockAuthClient = {
  geoEligibilityCheck: async () => ({ eligible: true }),
} as Partial<AuthClient> as AuthClient;

const storyWithContext = (
  account: Partial<Account>,
  storyName?: string,
  config?: Config
) => {
  const context = config
    ? {
        account: account as Account,
        config: config,
        authClient: mockAuthClient,
      }
    : { account: account as Account, authClient: mockAuthClient };

  const story = () => {
    return (
      <LocationProvider>
        <AppContext.Provider value={mockAppContext(context)}>
          <SettingsLayout>
            <PageSettings />
          </SettingsLayout>
        </AppContext.Provider>
      </LocationProvider>
    );
  };
  if (storyName) story.storyName = storyName;
  return story;
};

export const ColdStart = storyWithContext(coldStartAccount, 'cold start');

export const PartiallyFilledOut = storyWithContext(
  partiallyFilledOutAccount,
  'partially filled out'
);

export const CompletelyFilledOut = storyWithContext(
  completelyFilledOutAccount,
  'completely filled out'
);

export const PartiallyFilledOutWithKeyPromo = storyWithContext(
  accountEligibleForRecoveryKey,
  'with recovery key promo'
);

export const PartiallyFilledOutWithPhonePromo = storyWithContext(
  accountEligibleForRecoveryPhoneOnly,
  'with recovery phone promo'
);
