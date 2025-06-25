/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import { SETTINGS_PATH } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useTotpSetup } from '../../../lib/hooks/useTotpSetup';
import { totpUtils } from '../../../lib/totp-utils';
import { RecoveryPhoneSetupReason } from '../../../lib/types';
import {
  useAccount,
  useAlertBar,
  useConfig,
  useFtlMsgResolver,
} from '../../../models';

import { Choice, CHOICES } from '../../FormChoice';
import FlowSetup2faApp from '../FlowSetup2faApp';
import FlowSetup2faBackupChoice from '../FlowSetup2faBackupChoice';
import FlowSetup2faBackupCodeDownload from '../FlowSetup2faBackupCodeDownload';
import FlowSetup2faBackupCodeConfirm from '../FlowSetup2faBackupCodeConfirm';
import FlowSetupRecoveryPhoneSubmitNumber from '../FlowSetupRecoveryPhoneSubmitNumber';
import FlowSetupRecoveryPhoneConfirmCode from '../FlowSetupRecoveryPhoneConfirmCode';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

const Page2faSetup = (_: RouteComponentProps) => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const {
    totpInfo,
    loading: totpInfoLoading,
    error: totpInfoError,
  } = useTotpSetup();

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'page-2fa-setup-title',
    'Two-step authentication'
  );

  const [backupCodeError, setBackupCodeError] = useState('');
  const [backupMethod, setBackupMethod] = useState<Choice | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [flowHasPhoneChoice] = useState(() => account.recoveryPhone.available);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [phoneData, setPhoneData] = useState<{
    phoneNumber: string;
    nationalFormat: string | undefined;
  }>({ phoneNumber: '', nationalFormat: '' });

  // this will impact the progress bar
  // when recovery phone is available, an extra choice step is added
  const numberOfSteps = flowHasPhoneChoice ? 4 : 3;

  const showSuccess = useCallback(() => {
    alertBar.success(
      ftlMsgResolver.getMsg(
        'page-2fa-setup-success',
        'Two-step authentication has been enabled'
      )
    );
  }, [alertBar, ftlMsgResolver]);

  const showGenericError = useCallback(() => {
    alertBar.error(
      ftlMsgResolver.getMsg(
        'page-2fa-setup-totpinfo-error',
        'There was an error setting up two-step authentication. Try again later.'
      )
    );
  }, [alertBar, ftlMsgResolver]);

  const goHome = useCallback(
    () =>
      navigateWithQuery(SETTINGS_PATH + '#two-step-authentication', {
        replace: true,
      }),
    [navigateWithQuery]
  );
  const nextStep = useCallback(() => setCurrentStep((step) => step + 1), []);
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    } else goHome();
  }, [currentStep, goHome]);

  // generate & persist backup codes when users pick that route
  const createRecoveryCodes = useCallback(async () => {
    if (backupCodes.length || generatingCodes) return;
    setGeneratingCodes(true);
    const codes: string[] = await totpUtils.generateRecoveryCodes(
      config.recoveryCodes.count,
      config.recoveryCodes.length
    );
    setBackupCodes(codes);
    setGeneratingCodes(false);
  }, [backupCodes, config.recoveryCodes, generatingCodes]);

  // kick‑off generation when we reach the download step (with or without choice)
  useEffect(() => {
    const enteringDownloadStep =
      (backupMethod === CHOICES.code && currentStep === 3) ||
      (!flowHasPhoneChoice && currentStep === 2);
    if (enteringDownloadStep) {
      createRecoveryCodes();
    }
  }, [backupMethod, currentStep, flowHasPhoneChoice, createRecoveryCodes]);

  /* ───── early return states ───── */
  if (totpInfoLoading) return <LoadingSpinner fullScreen />;
  // if there is an issue retrieving totp info, 2FA cannot be set up
  // --> return to main settings page with alert bar message
  if (totpInfoError || !totpInfo) {
    alertBar.error(
      ftlMsgResolver.getMsg(
        'flow-setup-2fa-totpinfo-error',
        'There was an error setting up two-step authentication. Try again later.'
      )
    );
    goHome();
    return <></>;
  }

  /* ───── handlers ───── */
  const handleVerify2faAppCode = async (code: string) => {
    if (!totpInfo.secret) {
      showGenericError();
      goHome();
      return {};
    }

    if (!(await totpUtils.checkCode(totpInfo.secret, code))) {
      return { error: true };
    }

    GleanMetrics.accountPref.twoStepAuthQrCodeSuccess();

    // Proceed to backup method selection or backup code setup
    nextStep();
    return {};
  };

  const handleBackupChoice = (choice: Choice) => {
    setBackupMethod(choice);
    nextStep();
  };

  const enable2fa = async () => {
    if (!totpInfo.secret) {
      showGenericError();
      goHome();
      return;
    }

    const totpCode = await totpUtils.getCode(totpInfo.secret);
    if (!totpCode) {
      showGenericError();
      goHome();
      return;
    }
    await account.verifyTotp(totpCode);
  };

  const handleBackupCodeConfirm = async (code: string) => {
    if (!backupCodes.includes(code)) {
      setBackupCodeError(
        ftlMsgResolver.getMsg(
          'page-2fa-setup-incorrect-backup-code-error',
          'That code is not correct. Try again.'
        )
      );
      return;
    }

    try {
      await account.setRecoveryCodes(backupCodes);
      await enable2fa();
    } catch (error) {
      // for any error other than an incorrect backup code
      // return to main settings page with generic error message
      // there is no action the user can take at this step
      showGenericError();
      goHome();
      return;
    }

    showSuccess();
    goHome();
    return;
  };

  const handleVerifyPhone = async (phoneNumberInput: string) => {
    const { nationalFormat } = await account.addRecoveryPhone(phoneNumberInput);
    setPhoneData({
      phoneNumber: phoneNumberInput,
      nationalFormat,
    });
  };

  const handleResendSms = async () => {
    await account.addRecoveryPhone(phoneData.phoneNumber);
  };

  const handleVerifySmsCode = async (code: string) => {
    // if this errors, error will be handled by try/catch in child component
    await account.confirmRecoveryPhone(code, phoneData.phoneNumber, true);

    try {
      await enable2fa();
    } catch (e) {
      showGenericError();
      goHome();
      return;
    }
    await account.refresh('recoveryPhone');
    // success message controlled by child component
  };

  return (
    <VerifiedSessionGuard onDismiss={goHome} onError={goHome}>
      {currentStep === 1 && (
        <FlowSetup2faApp
          verifyCode={handleVerify2faAppCode}
          onBackButtonClick={goHome}
          {...{ currentStep, numberOfSteps, localizedPageTitle, totpInfo }}
        />
      )}

      {flowHasPhoneChoice && currentStep === 2 && (
        <FlowSetup2faBackupChoice
          onSubmitCb={handleBackupChoice}
          onBackButtonClick={prevStep}
          {...{ currentStep, numberOfSteps, localizedPageTitle }}
        />
      )}

      {((backupMethod === CHOICES.code && currentStep === 3) ||
        (!flowHasPhoneChoice && currentStep === 2)) && (
        <FlowSetup2faBackupCodeDownload
          email={account.email}
          loading={generatingCodes}
          onBackButtonClick={prevStep}
          onContinue={nextStep}
          {...{ backupCodes, currentStep, numberOfSteps, localizedPageTitle }}
        />
      )}

      {((backupMethod === CHOICES.code && currentStep === 4) ||
        (!flowHasPhoneChoice && currentStep === 3)) && (
        <FlowSetup2faBackupCodeConfirm
          verifyCode={handleBackupCodeConfirm}
          errorMessage={backupCodeError}
          setErrorMessage={setBackupCodeError}
          onBackButtonClick={prevStep}
          {...{ currentStep, numberOfSteps, localizedPageTitle }}
        />
      )}

      {backupMethod === CHOICES.phone && currentStep === 3 && (
        <FlowSetupRecoveryPhoneSubmitNumber
          navigateBackward={prevStep}
          navigateForward={nextStep}
          verifyPhoneNumber={handleVerifyPhone}
          reason={RecoveryPhoneSetupReason.setup}
          {...{ currentStep, numberOfSteps, localizedPageTitle }}
        />
      )}

      {backupMethod === CHOICES.phone && currentStep === 4 && (
        <FlowSetupRecoveryPhoneConfirmCode
          localizedSuccessMessage={ftlMsgResolver.getMsg(
            'page-2fa-setup-success',
            'Two-step authentication has been enabled'
          )}
          nationalFormatPhoneNumber={
            phoneData.nationalFormat || phoneData.phoneNumber
          }
          navigateBackward={prevStep}
          navigateForward={goHome}
          sendCode={handleResendSms}
          verifyRecoveryCode={handleVerifySmsCode}
          reason={RecoveryPhoneSetupReason.setup}
          {...{ currentStep, numberOfSteps, localizedPageTitle }}
        />
      )}
    </VerifiedSessionGuard>
  );
};

export default Page2faSetup;
