/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { DataCollection } from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import { mockAppContext } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';

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
