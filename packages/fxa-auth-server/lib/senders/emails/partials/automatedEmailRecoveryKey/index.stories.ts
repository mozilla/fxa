/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { MOCK_DEVICE_ALL } from '../userDevice/mocks';

export default {
  title: 'Partials/footers/automatedEmailRecoveryKey',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'This partial is used in footers for automated emails when the action involved an account recovery key.',
  {
    layout: null,
    subject: 'N/A',
    partial: 'automatedEmailRecoveryKey',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const AutomatedEmailRecoveryKey = createStory(
  {},
  'When no recovery key exists for the account.'
);

export const AutomatedEmailRecoveryKeyExists = createStory(
  {
    keyExists: true,
    revokeAccountRecoveryLink: 'http://localhost:3030/settings/#recovery-key',
  },
  'When recovery key exists for the account.'
);

export const AutomatedEmailRecoveryKeyInclDeviceInfo = createStory(
  {
    device: MOCK_DEVICE_ALL,
  },
  'With device information.'
);
