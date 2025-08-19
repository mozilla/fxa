/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineRecoverySetupFlow from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { InlineRecoverySetupFlowProps } from './interfaces';
import { MOCK_BACKUP_CODES, MOCK_EMAIL } from '../mocks';
import { MozServices } from '../../lib/types';

export default {
  title: 'Pages/InlineRecoverySetupFlow',
  component: InlineRecoverySetupFlow,
  decorators: [withLocalization],
} as Meta;

const flowHasPhoneChoice = true;
const serviceName = MozServices.Default;
const email = MOCK_EMAIL;
const navigateForward = () => {};
const navigateBackward = () => {};
const backupChoiceCb = async (x: string) => {};
const backupCodeError = '';
const setBackupCodeError = () => {};
const sendSmsCode = async () => {};
const verifyPhoneNumber = async () => {};
const verifySmsCode = async () => {};
const completeBackupCodeSetup = async () => {};
const successfulSetupHandler = () => {};

const ComponentWithRouter = (props: InlineRecoverySetupFlowProps) => (
  <LocationProvider>
    <InlineRecoverySetupFlow {...props} />
  </LocationProvider>
);

export const ChoiceScreen = () => (
  <ComponentWithRouter
    currentStep={1}
    backupMethod={null}
    backupCodes={[]}
    generatingCodes={false}
    phoneData={{ phoneNumber: '', nationalFormat: '' }}
    {...{
      flowHasPhoneChoice,
      serviceName,
      email,
      navigateForward,
      navigateBackward,
      backupChoiceCb,
      backupCodeError,
      setBackupCodeError,
      sendSmsCode,
      verifyPhoneNumber,
      verifySmsCode,
      completeBackupCodeSetup,
      successfulSetupHandler,
    }}
  />
);

export const BackupCodesCopyAndDownload = () => (
  <ComponentWithRouter
    currentStep={2}
    backupMethod={'code'}
    backupCodes={MOCK_BACKUP_CODES}
    generatingCodes={false}
    phoneData={{ phoneNumber: '', nationalFormat: '' }}
    {...{
      flowHasPhoneChoice,
      serviceName,
      email,
      navigateForward,
      navigateBackward,
      backupChoiceCb,
      backupCodeError,
      setBackupCodeError,
      sendSmsCode,
      verifyPhoneNumber,
      verifySmsCode,
      completeBackupCodeSetup,
      successfulSetupHandler,
    }}
  />
);

export const BackupCodesConfirmation = () => (
  <ComponentWithRouter
    currentStep={3}
    backupMethod={'code'}
    backupCodes={MOCK_BACKUP_CODES}
    generatingCodes={false}
    phoneData={{ phoneNumber: '', nationalFormat: '' }}
    {...{
      flowHasPhoneChoice,
      serviceName,
      email,
      navigateForward,
      navigateBackward,
      backupChoiceCb,
      backupCodeError,
      setBackupCodeError,
      sendSmsCode,
      verifyPhoneNumber,
      verifySmsCode,
      completeBackupCodeSetup,
      successfulSetupHandler,
    }}
  />
);

export const BackupCodesChoiceComplete = () => (
  <ComponentWithRouter
    currentStep={4}
    backupMethod={'code'}
    backupCodes={MOCK_BACKUP_CODES}
    generatingCodes={false}
    phoneData={{ phoneNumber: '', nationalFormat: '' }}
    {...{
      flowHasPhoneChoice,
      serviceName,
      email,
      navigateForward,
      navigateBackward,
      backupChoiceCb,
      backupCodeError,
      setBackupCodeError,
      sendSmsCode,
      verifyPhoneNumber,
      verifySmsCode,
      completeBackupCodeSetup,
      successfulSetupHandler,
    }}
  />
);

export const RecoveryPhoneNumber = () => (
  <ComponentWithRouter
    currentStep={2}
    backupMethod={'phone'}
    backupCodes={[]}
    generatingCodes={false}
    phoneData={{ phoneNumber: '', nationalFormat: '' }}
    {...{
      flowHasPhoneChoice,
      serviceName,
      email,
      navigateForward,
      navigateBackward,
      backupChoiceCb,
      backupCodeError,
      setBackupCodeError,
      sendSmsCode,
      verifyPhoneNumber,
      verifySmsCode,
      completeBackupCodeSetup,
      successfulSetupHandler,
    }}
  />
);

export const RecoveryPhoneConfirmation = () => (
  <ComponentWithRouter
    currentStep={3}
    backupMethod={'phone'}
    backupCodes={[]}
    generatingCodes={false}
    phoneData={{
      phoneNumber: '12345678900',
      nationalFormat: '+1 234-567-8900',
    }}
    {...{
      flowHasPhoneChoice,
      serviceName,
      email,
      navigateForward,
      navigateBackward,
      backupChoiceCb,
      backupCodeError,
      setBackupCodeError,
      sendSmsCode,
      verifyPhoneNumber,
      verifySmsCode,
      completeBackupCodeSetup,
      successfulSetupHandler,
    }}
  />
);

export const RecoveryPhoneChoiceComplete = () => (
  <ComponentWithRouter
    currentStep={4}
    backupMethod={'phone'}
    backupCodes={[]}
    generatingCodes={false}
    phoneData={{
      phoneNumber: '12345678900',
      nationalFormat: '+1 234-567-8900',
    }}
    {...{
      flowHasPhoneChoice,
      serviceName,
      email,
      navigateForward,
      navigateBackward,
      backupChoiceCb,
      backupCodeError,
      setBackupCodeError,
      sendSmsCode,
      verifyPhoneNumber,
      verifySmsCode,
      completeBackupCodeSetup,
      successfulSetupHandler,
    }}
  />
);
