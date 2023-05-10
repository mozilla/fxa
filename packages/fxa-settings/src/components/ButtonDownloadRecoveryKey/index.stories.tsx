/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';
import ButtonDownloadRecoveryKey from '.';
import { withLocalization } from '../../../.storybook/decorators';
import { Account, AppContext } from '../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../models/mocks';

export default {
  title: 'Components/ButtonDownloadRecoveryKey',
  component: ButtonDownloadRecoveryKey,
  decorators: [withLocalization],
} as Meta;

const recoveryKeyValue = 'RANDOM CODE RANDOM CODE RANDOM CODE';
const viewName = 'settings.recovery-key';

const account = MOCK_ACCOUNT as unknown as Account;

const accountWithLongEmail = {
  primaryEmail: {
    email:
      'supercalifragilisticexpialidocious@marypoppins.superfan.conference.com',
  },
} as unknown as Account;

const storyWithContext = (account: Account) => {
  const story = () => (
    <AppContext.Provider value={mockAppContext({ account })}>
      <AppLayout>
        {' '}
        <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
      </AppLayout>
    </AppContext.Provider>
  );
  return story;
};

export const Default = storyWithContext(account);

export const WithVeryLongEmail = storyWithContext(accountWithLongEmail);
