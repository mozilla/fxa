/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';
import ButtonDownloadRecoveryKey from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_EMAIL } from '../../pages/mocks';

export default {
  title: 'Components/ButtonDownloadRecoveryKey',
  component: ButtonDownloadRecoveryKey,
  decorators: [withLocalization],
} as Meta;

const recoveryKeyValue = 'ABCD 1234 ABCD 1234 ABCD 1234 ABCD O0O0';

const storyWithAccount = (email = MOCK_EMAIL) => {
  const story = () => (
    <AppLayout>
      <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, email }} />
    </AppLayout>
  );
  return story;
};

export const Default = storyWithAccount();

export const WithLongEmail = storyWithAccount(
  'supercalifragilisticexpialidocious.supercalifragilisticexpialidocious@gmail.com'
);
