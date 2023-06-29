/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import WarningMessage from '.';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import {
  MOCK_WARNING_MESSAGE_FTL_ID,
  MOCK_WARNING_MESSAGE,
  MOCK_WARNING_TYPE,
} from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/WarningMessage',
  component: WarningMessage,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <WarningMessage
      warningMessageFtlId={MOCK_WARNING_MESSAGE_FTL_ID}
      warningType={MOCK_WARNING_TYPE}
    >
      {MOCK_WARNING_MESSAGE}
    </WarningMessage>
  </AppLayout>
);
