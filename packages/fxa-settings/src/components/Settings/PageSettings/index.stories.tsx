/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Account } from '../../../models/Account';

import { PageSettings } from '.';
import { Config } from '../../../lib/config';

import { LocationProvider } from '@reach/router';
import { isMobileDevice } from '../../../lib/utilities';
import { mockAppContext, mockEmail, MOCK_ACCOUNT } from '../../../models/mocks';
import { MOCK_SERVICES } from '../ConnectedServices/mocks';
import { AppContext } from 'fxa-settings/src/models';
import { MOCK_LINKED_ACCOUNTS } from '../LinkedAccounts/mocks';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MockSettingsAppLayout } from '../AppLayout/mocks';

const SERVICES_NON_MOBILE = MOCK_SERVICES.filter((d) => !isMobileDevice(d));

export default {
  title: 'Pages/Settings',
  component: PageSettings,
  decorators: [withLocalization],
} as Meta;

const coldStartAccount = {
  ...MOCK_ACCOUNT,
  displayName: null,
  avatar: { id: null, url: null },
  recoveryKey: { exists: false },
  totp: { exists: false, verified: false },
  attachedClients: [SERVICES_NON_MOBILE[0]],
} as unknown as Account;

const partiallyFilledOutAccount = {
  ...MOCK_ACCOUNT,
  displayName: null,
  totp: { exists: true, verified: false },
  attachedClients: SERVICES_NON_MOBILE,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
} as unknown as Account;

const accountWithoutRecoveryKey = {
  ...MOCK_ACCOUNT,
  displayName: null,
  recoveryKey: { exists: false },
  totp: { exists: true, verified: false },
  attachedClients: SERVICES_NON_MOBILE,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
} as unknown as Account;

const completelyFilledOutAccount = {
  ...MOCK_ACCOUNT,
  subscriptions: [{ created: 1, productName: 'x' }],
  emails: [mockEmail(), mockEmail('johndope2@gmail.com', false)],
  attachedClients: SERVICES_NON_MOBILE,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
};

const storyWithContext = (
  account: Partial<Account>,
  storyName?: string,
  config?: Config
) => {
  const context = config
    ? { account: account as Account, config: config }
    : { account: account as Account };

  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext(context)}>
        <MockSettingsAppLayout>
          <PageSettings />
        </MockSettingsAppLayout>
      </AppContext.Provider>
    </LocationProvider>
  );
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
  accountWithoutRecoveryKey,
  'with recovery key promo'
);
