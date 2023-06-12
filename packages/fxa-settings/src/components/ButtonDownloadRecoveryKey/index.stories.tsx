/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';
import ButtonDownloadRecoveryKey, { fileContentVariation } from '.';
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

const storyWithContext = (
  account: Account,
  fileType?: fileContentVariation
) => {
  const story = () => (
    <AppContext.Provider value={mockAppContext({ account })}>
      <AppLayout>
        <ButtonDownloadRecoveryKey
          {...{ recoveryKeyValue, viewName, fileType }}
        />
      </AppLayout>
    </AppContext.Provider>
  );
  return story;
};

export const Default = storyWithContext(account);

export const WithVeryLongEmail = storyWithContext(accountWithLongEmail);

// The following stories are added for testing purposes
export const DetailedDownloadWithBOM = storyWithContext(
  account,
  fileContentVariation['withBOM']
);

export const DetailedDownloadWithCharSet = storyWithContext(
  account,
  fileContentVariation['withCharSet']
);

export const DetailedDownloadWithTextEncoder = storyWithContext(
  account,
  fileContentVariation['withTextEncoder']
);
