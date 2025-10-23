/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { FlowSetup2faBackupCodeDownload } from '.';
import { MOCK_BACKUP_CODES, MOCK_EMAIL } from '../../../pages/mocks';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Components/Settings/FlowSetup2faBackupCodeDownload',
  component: FlowSetup2faBackupCodeDownload,
  decorators: [
    withLocalization,
    withLocation('/settings/two_step_authentication'),
  ],
} as Meta;

const navigateBackward = async () => {
  action('navigateBackward')();
};

const onContinue = () => {
  action('onContinue')();
};

export const Default = () => (
  <SettingsLayout>
    <FlowSetup2faBackupCodeDownload
      currentStep={2}
      numberOfSteps={3}
      localizedPageTitle="Two-step authentication"
      onBackButtonClick={navigateBackward}
      showProgressBar
      email={MOCK_EMAIL}
      backupCodes={MOCK_BACKUP_CODES}
      onContinue={onContinue}
    />
  </SettingsLayout>
);
