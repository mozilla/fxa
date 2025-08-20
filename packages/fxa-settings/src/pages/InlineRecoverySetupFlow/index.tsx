/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useMemo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useFtlMsgResolver } from '../../models';
import AppLayout from '../../components/AppLayout';
import { InlineRecoverySetupFlowProps } from './interfaces';
import {
  GleanClickEventType2FA,
  RecoveryPhoneSetupReason,
} from '../../lib/types';
import FlowSetup2faBackupChoice from '../../components/Settings/FlowSetup2faBackupChoice';
import FlowSetup2faBackupCodeDownload from '../../components/Settings/FlowSetup2faBackupCodeDownload';
import FlowSetup2faBackupCodeConfirm from '../../components/Settings/FlowSetup2faBackupCodeConfirm';
import FlowSetupRecoveryPhoneSubmitNumber from '../../components/Settings/FlowSetupRecoveryPhoneSubmitNumber';
import FlowSetupRecoveryPhoneConfirmCode from '../../components/Settings/FlowSetupRecoveryPhoneConfirmCode';
import FlowSetup2faComplete from '../../components/Settings/FlowSetup2faComplete';
import { CHOICES } from '../../components/FormChoice';

const InlineRecoverySetupFlow = ({
  flowHasPhoneChoice,
  serviceName,
  email,
  currentStep,
  backupMethod,
  backupCodes,
  generatingCodes,
  phoneData,
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
}: InlineRecoverySetupFlowProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'page-2fa-setup-title',
    'Two-step authentication'
  );

  const BackupChoice = useCallback(
    () => (
      <FlowSetup2faBackupChoice
        onSubmitCb={backupChoiceCb}
        onBackButtonClick={navigateBackward}
        reason={GleanClickEventType2FA.inline}
        {...{ currentStep, localizedPageTitle }}
      />
    ),
    [backupChoiceCb, currentStep, localizedPageTitle, navigateBackward]
  );

  const CodeDownload = useCallback(
    () => (
      <FlowSetup2faBackupCodeDownload
        {...{
          backupCodes,
          currentStep,
          reason: GleanClickEventType2FA.inline,
          email,
          onContinue: navigateForward,
          onBackButtonClick: navigateBackward,
          localizedPageTitle,
          loading: generatingCodes,
        }}
      />
    ),
    [
      backupCodes,
      currentStep,
      email,
      localizedPageTitle,
      navigateBackward,
      navigateForward,
      generatingCodes,
    ]
  );

  const CodeConfirm = useCallback(
    () => (
      <FlowSetup2faBackupCodeConfirm
        verifyCode={completeBackupCodeSetup}
        {...{
          currentStep,
          reason: GleanClickEventType2FA.inline,
          onBackButtonClick: navigateBackward,
          errorMessage: backupCodeError,
          setErrorMessage: setBackupCodeError,
          localizedPageTitle,
        }}
      />
    ),
    [
      backupCodeError,
      completeBackupCodeSetup,
      currentStep,
      localizedPageTitle,
      navigateBackward,
      setBackupCodeError,
    ]
  );

  const RecoveryPhoneSubmit = useCallback(
    () => (
      <FlowSetupRecoveryPhoneSubmitNumber
        {...{
          navigateForward,
          navigateBackward,
          verifyPhoneNumber,
          localizedPageTitle,
          reason: RecoveryPhoneSetupReason.inline,
        }}
      />
    ),
    [localizedPageTitle, navigateBackward, navigateForward, verifyPhoneNumber]
  );

  const RecoveryPhoneConfirm = useCallback(
    () => (
      <FlowSetupRecoveryPhoneConfirmCode
        {...{
          currentStep,
          reason: RecoveryPhoneSetupReason.inline,
          nationalFormatPhoneNumber: phoneData.nationalFormat as string,
          navigateForward,
          navigateBackward,
          sendCode: sendSmsCode,
          verifyRecoveryCode: verifySmsCode,
          localizedPageTitle,
        }}
      />
    ),
    [
      currentStep,
      localizedPageTitle,
      navigateBackward,
      navigateForward,
      phoneData.nationalFormat,
      sendSmsCode,
      verifySmsCode,
    ]
  );

  const Complete = useCallback(
    () =>
      backupMethod === CHOICES.code ? (
        <FlowSetup2faComplete
          {...{
            serviceName,
            backupType: backupMethod as typeof CHOICES.code,
            numCodesRemaining: backupCodes.length,
            reason: GleanClickEventType2FA.inline,
            onContinue: () => {
              successfulSetupHandler();
            },
          }}
        />
      ) : (
        <FlowSetup2faComplete
          {...{
            serviceName,
            backupType: backupMethod as typeof CHOICES.phone,
            lastFourPhoneDigits: phoneData.phoneNumber.slice(-4),
            reason: GleanClickEventType2FA.inline,
            onContinue: () => {
              successfulSetupHandler();
            },
          }}
        />
      ),
    [
      backupCodes.length,
      backupMethod,
      phoneData.phoneNumber,
      serviceName,
      successfulSetupHandler,
    ]
  );

  const steps = useMemo(() => {
    if (flowHasPhoneChoice) {
      switch (backupMethod) {
        case CHOICES.phone:
          return [
            BackupChoice,
            RecoveryPhoneSubmit,
            RecoveryPhoneConfirm,
            Complete,
          ];
        case CHOICES.code:
        default:
          return [BackupChoice, CodeDownload, CodeConfirm, Complete];
      }
    }

    return [CodeDownload, CodeConfirm, Complete];
  }, [
    BackupChoice,
    CodeConfirm,
    CodeDownload,
    Complete,
    RecoveryPhoneConfirm,
    RecoveryPhoneSubmit,
    backupMethod,
    flowHasPhoneChoice,
  ]);

  return <AppLayout wrapInCard={false}>{steps[currentStep - 1]()}</AppLayout>;
};

export default InlineRecoverySetupFlow;
