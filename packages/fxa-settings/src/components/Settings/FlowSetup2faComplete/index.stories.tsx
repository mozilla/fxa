/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import FlowSetup2faComplete from '.';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Components/Settings/FlowSetup2faComplete',
  component: FlowSetup2faComplete,
  decorators: [
    withLocalization,
    withLocation('/settings/two_step_authentication'),
  ],
} as Meta;

const onContinue = () => {
  action('onContinue')();
};

export const BackupCode = () => (
  <SettingsLayout>
    <FlowSetup2faComplete
      serviceName="123Done"
      onContinue={onContinue}
      backupType="code"
      numCodesRemaining={8}
    />
  </SettingsLayout>
);

export const RecoveryPhone = () => (
  <SettingsLayout>
    <FlowSetup2faComplete
      serviceName="123Done"
      onContinue={onContinue}
      backupType="phone"
      lastFourPhoneDigits="4567"
    />
  </SettingsLayout>
);
