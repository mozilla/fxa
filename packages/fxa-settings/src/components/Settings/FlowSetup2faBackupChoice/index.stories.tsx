/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { FlowSetup2faBackupChoice } from '.';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Components/Settings/FlowSetup2faBackupChoice',
  decorators: [
    withLocalization,
    withLocation('/settings/two_step_authentication'),
  ],
} as Meta;

const navigateBackward = async () => {
  action('navigateBackward')();
};

const onSubmitCb = async (choice: string) => {
  action('onSubmitCb')(choice);
};

export const Default = () => (
  <SettingsLayout>
    <FlowSetup2faBackupChoice
      currentStep={2}
      numberOfSteps={3}
      localizedPageTitle="Two-step authentication"
      onBackButtonClick={navigateBackward}
      showProgressBar
      onSubmitCb={onSubmitCb}
    />
  </SettingsLayout>
);
