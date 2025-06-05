/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { GleanClickEventType2FA } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';
import { BackupCodesImage } from '../../images';
import FormVerifyTotp from '../../FormVerifyTotp';
import { useFtlMsgResolver } from '../../../models';
import Banner from '../../Banner';

type FlowSetup2faBackupCodeConfirmProps = {
  currentStep?: number;
  numberOfSteps?: number;
  hideBackButton?: boolean;
  localizedFlowTitle: string;
  onBackButtonClick?: () => void;
  showProgressBar?: boolean;
  verifyCode: (code: string) => Promise<void>;
  errorMessage: string;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  reason?: GleanClickEventType2FA;
};

export const FlowSetup2faBackupCodeConfirm = ({
  currentStep,
  numberOfSteps,
  hideBackButton = false,
  localizedFlowTitle,
  onBackButtonClick,
  showProgressBar = true,
  verifyCode,
  setErrorMessage,
  errorMessage,
  reason = GleanClickEventType2FA.setup,
}: FlowSetup2faBackupCodeConfirmProps) => {
  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthEnterCodeView({
      event: { reason },
    });
  }, [reason]);

  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <FlowContainer
      title={localizedFlowTitle}
      {...{ hideBackButton, onBackButtonClick }}
    >
      {showProgressBar && currentStep != null && numberOfSteps != null && (
        <ProgressBar {...{ currentStep, numberOfSteps }} />
      )}
      {errorMessage && (
        <Banner
          type="error"
          bannerId="backup-code-confirm-error"
          content={{ localizedDescription: errorMessage }}
        />
      )}
      <BackupCodesImage />
      <FtlMsg id="flow-setup-2fa-backup-code-confirm-heading">
        <h2 className="font-bold text-xl my-2">
          Enter backup authentication code
        </h2>
      </FtlMsg>
      <FtlMsg id="flow-setup-2fa-backup-code-confirm-confirm-saved">
        <p>
          Confirm you saved your codes by entering one. Without these codes, you
          might not be able to sign in if you don’t have your authenticator app.
        </p>
      </FtlMsg>
      <FormVerifyTotp
        codeType="alphanumeric"
        codeLength={10}
        {...{ verifyCode, errorMessage, setErrorMessage }}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'flow-setup-2fa-backup-code-confirm-button-finish',
          'Finish'
        )}
        localizedInputLabel={ftlMsgResolver.getMsg(
          'flow-setup-2fa-backup-code-confirm-code-input',
          'Enter 10-character code'
        )}
        errorBannerId="backup-code-confirm-error"
        clearBanners={() => setErrorMessage('')}
        gleanDataAttrs={{
          id: 'two_step_auth_enter_code_submit',
          type: reason,
        }}
        className="mt-6"
      />
    </FlowContainer>
  );
};
