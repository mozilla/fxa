/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner from '../../Banner';
import FormVerifyTotp from '../../FormVerifyTotp';
import { BackupRecoveryPhoneCodeImage } from '../../images';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useAlertBar, useFtlMsgResolver } from '../../../models';
import { RecoveryPhoneSetupReason, ResendStatus } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';

export type FlowSetupRecoveryPhoneConfirmCodeProps = {
  currentStep?: number;
  nationalFormatPhoneNumber: string;
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  numberOfSteps?: number;
  reason?: RecoveryPhoneSetupReason;
  sendCode: () => Promise<void>;
  verifyRecoveryCode: (code: string) => Promise<void>;
};

export const FlowSetupRecoveryPhoneConfirmCode = ({
  currentStep = 2,
  nationalFormatPhoneNumber,
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  numberOfSteps = 2,
  reason = RecoveryPhoneSetupReason.setup,
  sendCode,
  verifyRecoveryCode,
}: FlowSetupRecoveryPhoneConfirmCodeProps) => {
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState('');
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );

  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthPhoneVerifyView({
      event: { reason },
    });
  }, [reason]);

  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const clearBanners = async () => {
    setResendStatus(ResendStatus.none);
    setLocalizedErrorBannerMessage(''); // Clear the banner message
  };

  const handleResendCode = async () => {
    await clearBanners();
    try {
      await sendCode();
      setResendStatus(ResendStatus.sent);
    } catch (error) {
      const localizedError = getLocalizedErrorMessage(ftlMsgResolver, error);
      setLocalizedErrorBannerMessage(localizedError);
    }
    return;
  };

  const handleSubmit = async (code: string) => {
    await clearBanners();

    try {
      await verifyRecoveryCode(code);

      alertBar.success(
        reason === RecoveryPhoneSetupReason.setup
          ? ftlMsgResolver.getMsg(
              'flow-setup-phone-confirm-code-success-message-v2',
              'Recovery phone added'
            )
          : ftlMsgResolver.getMsg(
              'flow-change-phone-confirm-code-success-message',
              'Recovery phone changed'
            )
      );
      navigateForward();
    } catch (error) {
      const localizedError = getLocalizedErrorMessage(ftlMsgResolver, error);
      setLocalizedErrorBannerMessage(localizedError);
      const codeInput = document.querySelector(
        'input[name="code"]'
      ) as HTMLInputElement;
      if (codeInput) {
        codeInput.focus();
      }
    }
    return;
  };

  return (
    <FlowContainer
      {...{ localizedBackButtonTitle }}
      title={localizedPageTitle}
      onBackButtonClick={navigateBackward}
    >
      <ProgressBar {...{ currentStep, numberOfSteps }} />
      {resendStatus === ResendStatus.sent && !localizedErrorBannerMessage && (
        <Banner
          type="success"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'flow-setup-phone-confirm-code-resend-code-success',
              'Code sent'
            ),
          }}
        />
      )}
      {localizedErrorBannerMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorBannerMessage }}
          bannerId="flow-setup-phone-confirm-code-error"
        />
      )}
      <BackupRecoveryPhoneCodeImage />
      <FtlMsg id="flow-setup-phone-confirm-code-heading">
        <h2 className="font-bold text-xl">Enter verification code</h2>
      </FtlMsg>
      <FtlMsg
        id="flow-setup-phone-confirm-code-instruction"
        elems={{ span: <span dir="ltr" className="font-bold"></span> }}
        vars={{ phoneNumber: nationalFormatPhoneNumber }}
      >
        <p className="text-base mt-4">
          A 6-digit code was sent to{' '}
          <span dir="ltr" className="font-bold">
            {nationalFormatPhoneNumber}
          </span>{' '}
          by text message. This code expires after 5 minutes.
        </p>
      </FtlMsg>

      <FormVerifyTotp
        codeLength={6}
        codeType="numeric"
        errorMessage={localizedErrorBannerMessage}
        localizedInputLabel={ftlMsgResolver.getMsg(
          'flow-setup-phone-confirm-code-input-label',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'flow-setup-phone-confirm-code-button',
          'Confirm'
        )}
        setErrorMessage={setLocalizedErrorBannerMessage}
        verifyCode={handleSubmit}
        errorBannerId="flow-setup-phone-confirm-code-error"
        gleanDataAttrs={{
          id: 'two_step_auth_phone_verify_submit',
          type: reason,
        }}
        className="my-6"
      />
      <div className="flex flex-wrap gap-2 mt-6 justify-center text-center">
        <FtlMsg id="flow-setup-phone-confirm-code-expired">
          <p>Code expired?</p>
        </FtlMsg>
        <FtlMsg id="flow-setup-phone-confirm-code-resend-code-button">
          <button
            className="link-blue"
            onClick={handleResendCode}
            data-glean-id="two_step_auth_phone_verify_resend_code"
            data-glean-type={reason}
          >
            Resend code
          </button>
        </FtlMsg>
      </div>
    </FlowContainer>
  );
};

export default FlowSetupRecoveryPhoneConfirmCode;
