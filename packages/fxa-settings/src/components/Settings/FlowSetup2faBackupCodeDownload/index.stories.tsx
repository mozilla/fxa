/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { action } from '@storybook/addon-actions';
import { FlowSetup2faBackupCodeDownLoad } from '.';

export default {
  title: 'Components/Settings/FlowSetup2faBackupCodeDownLoad',
  component: FlowSetup2faBackupCodeDownLoad,
  decorators: [withLocalization],
} as Meta;

const navigateBackward = async () => {
  action('navigateBackward')();
};

const dummyTotpInfo = {
  recoveryCodes: [
    'code111111',
    'code222222',
    'code333333',
    'code444444',
    'code555555',
    'code666666',
    'code777777',
    'code888888',
  ],
};

const onContinue = () => {
  action('onContinue')();
};

export const Default = () => (
  <SettingsLayout>
    <FlowSetup2faBackupCodeDownLoad
      currentStep={2}
      numberOfSteps={3}
      localizedFlowTitle="Two-step authentication"
      onBackButtonClick={navigateBackward}
      showProgressBar
      totpInfo={dummyTotpInfo}
      onContinue={onContinue}
    />
  </SettingsLayout>
);
