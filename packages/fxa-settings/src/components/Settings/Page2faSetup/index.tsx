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
import { MfaReason, RecoveryPhoneSetupReason } from '../../../lib/types';
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
import { MfaGuard } from '../MfaGuard';
import { isInvalidJwtError } from '../../../lib/mfa-guard-utils';
import { useErrorHandler } from 'react-error-boundary';

export const MfaGuardPage2faSetup = (_: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="2fa" reason={MfaReason.createTotp}>
      <Page2faSetup />
    </MfaGuard>
  );
};

export const Page2faSetup = () => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const config = useConfig();
  const errorHandler = useErrorHandler();
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

  const alertBarSuccessMessage = useCallback(() => {
    return (
      <div>
        <p>
          <strong>
            {ftlMsgResolver.getMsg(
              'page-2fa-setup-success',
              'Two-step authentication has been enabled'
            )}
          </strong>
        </p>
        <p>
          {ftlMsgResolver.getMsg(
            'page-2fa-setup-success-additional-message',
            'To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using two-step authentication.'
          )}
        </p>
      </div>
    );
  }, [ftlMsgResolver]);

  const handle2faSetupSuccess = useCallback(() => {
    alertBar.success(alertBarSuccessMessage());
    navigateWithQuery(
      SETTINGS_PATH + '#connected-services',
      {
        replace: true,
      },
      false
    );
  }, [alertBar, alertBarSuccessMessage, navigateWithQuery]);

  const showGenericError = useCallback(() => {
    alertBar.error(
      ftlMsgResolver.getMsg(
        'page-2fa-setup-totpinfo-error',
        'There was an error setting up two-step authentication. Try again later.'
      )
    );
  }, [alertBar, ftlMsgResolver]);

  const goBackToSettings = useCallback(
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
    } else goBackToSettings();
  }, [currentStep, goBackToSettings]);

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

  // if there is an issue retrieving totp info, 2FA cannot be set up
  // --> return to main settings page with alert bar message
  useEffect(() => {
    if (!totpInfoLoading && (totpInfoError || !totpInfo)) {
      showGenericError();
      goBackToSettings();
    }
  }, [
    totpInfoLoading,
    totpInfoError,
    totpInfo,
    showGenericError,
    goBackToSettings,
  ]);

  if (totpInfoLoading) return <LoadingSpinner fullScreen />;

  if (totpInfoError || !totpInfo) {
    return <></>;
  }

  const handleVerify2faAppCode = async (code: string) => {
    try {
      await account.verifyTotpSetupCodeWithJwt(code);
      GleanMetrics.accountPref.twoStepAuthQrCodeSuccess();
      nextStep();
      return {};
    } catch (e) {
      if (isInvalidJwtError(e)) {
        errorHandler(e);
        return {};
      }
      return { error: true };
    }
  };

  const handleBackupChoice = (choice: Choice) => {
    setBackupMethod(choice);
    nextStep();
  };

  const enable2fa = async () => {
    try {
      await account.completeTotpSetupWithJwt();
      handle2faSetupSuccess();
      return;
    } catch (e) {
      if (isInvalidJwtError(e)) {
        errorHandler(e);
        return;
      }
      showGenericError();
      goBackToSettings();
      return;
    }
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
      await account.setRecoveryCodesWithJwt(backupCodes);
    } catch (error) {
      if (isInvalidJwtError(error)) {
        errorHandler(error);
      } else {
        showGenericError();
        goBackToSettings();
      }
      return;
    }

    await enable2fa();
  };

  const handleVerifyPhone = async (phoneNumberInput: string) => {
    try {
      const { nationalFormat } =
        await account.addRecoveryPhoneWithJwt(phoneNumberInput);
      setPhoneData({
        phoneNumber: phoneNumberInput,
        nationalFormat,
      });
    } catch (error) {
      if (isInvalidJwtError(error)) {
        errorHandler(error);
        return;
      }
      throw error;
    }
  };

  const handleResendSms = async () => {
    try {
      await account.addRecoveryPhoneWithJwt(phoneData.phoneNumber);
    } catch (error) {
      if (isInvalidJwtError(error)) {
        errorHandler(error);
        return;
      }
      throw error;
    }
  };

  const handleVerifySmsCode = async (code: string) => {
    try {
      await account.confirmRecoveryPhoneWithJwt(code);
    } catch (error) {
      if (isInvalidJwtError(error)) {
        errorHandler(error);
        return;
      }
      throw error;
    }

    await enable2fa();
  };

  return (
    <>
      {currentStep === 1 && (
        <FlowSetup2faApp
          verifyCode={handleVerify2faAppCode}
          onBackButtonClick={goBackToSettings}
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
          nationalFormatPhoneNumber={
            phoneData.nationalFormat || phoneData.phoneNumber
          }
          navigateBackward={prevStep}
          sendCode={handleResendSms}
          showRecoveryPhoneSuccessMessage={false} // we'll instead show a success message for 2fa setup
          verifyRecoveryCode={handleVerifySmsCode}
          reason={RecoveryPhoneSetupReason.setup}
          {...{ currentStep, numberOfSteps, localizedPageTitle }}
        />
      )}
    </>
  );
};

export default MfaGuardPage2faSetup;
