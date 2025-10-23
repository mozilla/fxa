/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { useCallback, useEffect, useState } from 'react';
import { useErrorHandler } from 'react-error-boundary';
import { SETTINGS_PATH } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { isInvalidJwtError } from '../../../lib/mfa-guard-utils';
import { totpUtils } from '../../../lib/totp-utils';
import { GleanClickEventType2FA, MfaReason } from '../../../lib/types';
import {
  useAccount,
  useAlertBar,
  useConfig,
  useFtlMsgResolver,
  useSession,
} from '../../../models';
import FlowSetup2faBackupCodeConfirm from '../FlowSetup2faBackupCodeConfirm';
import FlowSetup2faBackupCodeDownload from '../FlowSetup2faBackupCodeDownload';
import { MfaGuard } from '../MfaGuard';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

export const MfaGuardPage2faReplaceBackupCodes = (
  props: RouteComponentProps
) => {
  return (
    <MfaGuard requiredScope="2fa" reason={MfaReason.createBackupCodes}>
      <Page2faReplaceBackupCodes {...props} />
    </MfaGuard>
  );
};

export const Page2faReplaceBackupCodes = (_: RouteComponentProps) => {
  const alertBar = useAlertBar();
  const navigateWithQuery = useNavigateWithQuery();
  const session = useSession();
  const account = useAccount();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const errorHandler = useErrorHandler();

  const goHome = () =>
    navigateWithQuery(SETTINGS_PATH + '#two-step-authentication', {
      replace: true,
    });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [backupCodeError, setBackupCodeError] = useState<string>('');

  // Determine if user is replacing existing codes or creating new ones
  // This informs if we need to pass custom messaging to the flow components
  const isReplacingCodes =
    account.backupCodes?.hasBackupCodes &&
    (account.backupCodes?.count || 0) > 0;

  const alertSuccessAndGoHome = () => {
    const successMessage = isReplacingCodes
      ? ftlMsgResolver.getMsg(
          'tfa-replace-code-success-alert-4',
          'Backup authentication codes updated'
        )
      : ftlMsgResolver.getMsg(
          'tfa-create-code-success-alert',
          'Backup authentication codes created'
        );

    alertBar.success(successMessage, () =>
      GleanMetrics.accountPref.twoStepAuthEnterCodeSuccessView({
        event: { reason: GleanClickEventType2FA.replace },
      })
    );
    navigateWithQuery(SETTINGS_PATH + '#two-step-authentication', {
      replace: true,
    });
  };

  const handleBackupCodeConfirm = async (code: string) => {
    try {
      if (!newBackupCodes.includes(code)) {
        setBackupCodeError(
          ftlMsgResolver.getMsg(
            'tfa-incorrect-recovery-code-1',
            'Incorrect backup authentication code'
          )
        );
        return;
      }

      const { success } = await account.updateRecoveryCodes(newBackupCodes);

      if (!success)
        throw new Error('Update backup authentication codes not successful.');

      alertSuccessAndGoHome();
    } catch (e) {
      if (isInvalidJwtError(e)) {
        // JWT invalid/expired
        errorHandler(e);
        return;
      }

      const errorMessage = isReplacingCodes
        ? ftlMsgResolver.getMsg(
            'tfa-replace-code-error-3',
            'There was a problem replacing your backup authentication codes'
          )
        : ftlMsgResolver.getMsg(
            'tfa-create-code-error',
            'There was a problem creating your backup authentication codes'
          );
      setBackupCodeError(errorMessage);
    }
  };

  const createNewBackupCodes = useCallback(async () => {
    try {
      if (
        !config.recoveryCodes ||
        !config.recoveryCodes.count ||
        !config.recoveryCodes.length
      ) {
        throw new Error('Invalid config for recoveryCodes.');
      }

      const codes = await totpUtils.generateRecoveryCodes(
        config.recoveryCodes.count,
        config.recoveryCodes.length
      );
      setNewBackupCodes(codes);
    } catch (e) {
      const errorMessage = isReplacingCodes
        ? ftlMsgResolver.getMsg(
            'tfa-replace-code-error-3',
            'There was a problem replacing your backup authentication codes'
          )
        : ftlMsgResolver.getMsg(
            'tfa-create-code-error',
            'There was a problem creating your backup authentication codes'
          );
      alertBar.error(errorMessage);
    }
  }, [config, alertBar, ftlMsgResolver, isReplacingCodes]);

  const nextStep = () => {
    setCurrentStep((step) => step + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    } else {
      goHome();
    }
  };

  useEffect(() => {
    session.verified && newBackupCodes.length < 1 && createNewBackupCodes();
  }, [session, newBackupCodes, createNewBackupCodes]);

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'tfa-backup-codes-page-title',
    'Backup authentication codes'
  );

  const replaceDownloadDescription = ftlMsgResolver.getMsg(
    'tfa-replace-code-download-description',
    'Keep these in a place you’ll remember. Your old codes will be replaced after you finish the next step.'
  );
  const replaceConfirmDescription = ftlMsgResolver.getMsg(
    'tfa-replace-code-confirm-description',
    'Confirm you saved your codes by entering one. Your old backup authentication codes will be disabled once this step is completed.'
  );

  return (
    <VerifiedSessionGuard onDismiss={goHome} onError={goHome}>
      {currentStep === 1 && (
        <FlowSetup2faBackupCodeDownload
          backupCodes={newBackupCodes}
          currentStep={1}
          numberOfSteps={2}
          email={account.email}
          loading={newBackupCodes.length === 0}
          onBackButtonClick={goHome}
          onContinue={nextStep}
          localizedPageTitle={localizedPageTitle}
          reason={GleanClickEventType2FA.replace}
          showProgressBar={true}
          customDescription={
            isReplacingCodes ? replaceDownloadDescription : undefined
          }
        />
      )}

      {currentStep === 2 && (
        <FlowSetup2faBackupCodeConfirm
          currentStep={2}
          numberOfSteps={2}
          onBackButtonClick={prevStep}
          verifyCode={handleBackupCodeConfirm}
          errorMessage={backupCodeError}
          setErrorMessage={setBackupCodeError}
          localizedPageTitle={localizedPageTitle}
          reason={GleanClickEventType2FA.replace}
          showProgressBar={true}
          customDescription={
            isReplacingCodes ? replaceConfirmDescription : undefined
          }
        />
      )}
    </VerifiedSessionGuard>
  );
};
