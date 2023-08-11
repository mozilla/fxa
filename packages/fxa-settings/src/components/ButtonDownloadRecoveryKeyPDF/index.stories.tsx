/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';
import ButtonDownloadRecoveryKeyPDF from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Account, AppContext } from '../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../models/mocks';

export default {
  title: 'Components/ButtonDownloadRecoveryKeyPDF',
  component: ButtonDownloadRecoveryKeyPDF,
  decorators: [withLocalization],
} as Meta;

const recoveryKeyValue = 'ABCD 1234 ABCD 1234 ABCD 1234 ABCD O0O0';
const viewName = 'settings.recovery-key';

const account = MOCK_ACCOUNT as unknown as Account;
const accountWithLongEmail = {
  ...MOCK_ACCOUNT,
  primaryEmail: {
    email:
      'supercalifragilisticexpialidocious.supercalifragilisticexpialidocious@gmail.com',
  },
} as unknown as Account;

const storyWithAccount = (account: Account) => {
  const story = () => (
    <AppContext.Provider value={mockAppContext({ account })}>
      <AppLayout>
        <ButtonDownloadRecoveryKeyPDF {...{ recoveryKeyValue, viewName }} />
      </AppLayout>
    </AppContext.Provider>
  );
  return story;
};

export const Default = storyWithAccount(account);

export const WithLongEmail = storyWithAccount(accountWithLongEmail);
