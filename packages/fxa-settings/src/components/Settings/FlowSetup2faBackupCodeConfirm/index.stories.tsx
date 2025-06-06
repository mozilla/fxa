/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { action } from '@storybook/addon-actions';
import { FlowSetup2faBackupCodeConfirm } from '.';

export default {
  title: 'Components/Settings/FlowSetup2faBackupCodeConfirm',
  component: FlowSetup2faBackupCodeConfirm,
  decorators: [withLocalization],
} as Meta;

const navigateBackward = async () => {
  action('navigateBackward')();
};

const verifyCode = (code: string) => {
  action('verifyCode')(code);
  return Promise.resolve();
};

export const Default = () => (
  <SettingsLayout>
    <FlowSetup2faBackupCodeConfirm
      currentStep={3}
      numberOfSteps={3}
      localizedFlowTitle="Two-step authentication"
      onBackButtonClick={navigateBackward}
      showProgressBar
      errorMessage=""
      setErrorMessage={() => {}}
      verifyCode={verifyCode}
    />
  </SettingsLayout>
);

export const WithError = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const verifyCodeError = (code: string) => {
    action('verifyCode')(code);
    setErrorMessage('Invalid recovery code');
    return Promise.resolve();
  };
  return (
    <SettingsLayout>
      <FlowSetup2faBackupCodeConfirm
        currentStep={3}
        numberOfSteps={3}
        localizedFlowTitle="Two-step authentication"
        onBackButtonClick={navigateBackward}
        showProgressBar
        {...{ errorMessage, setErrorMessage }}
        verifyCode={verifyCodeError}
      />
    </SettingsLayout>
  );
};
