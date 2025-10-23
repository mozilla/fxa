/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { DataCollection } from '.';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';

export default {
  title: 'Components/Settings/DataCollection',
  component: DataCollection,
  decorators: [withLocalization],
} as Meta;

const accountWithMetrics = {
  metricsEnabled: true,
} as unknown as Account;

const accountWithoutMetrics = {
  metricsEnabled: false,
} as unknown as Account;

const storyWithContext = (account: Partial<Account>) => {
  const context = { account: account as Account };

  const story = () => (
    <AppContext.Provider value={mockAppContext(context)}>
      <DataCollection />
    </AppContext.Provider>
  );
  return story;
};

export const CollectionOn = storyWithContext(accountWithMetrics);

export const CollectionOff = storyWithContext(accountWithoutMetrics);
