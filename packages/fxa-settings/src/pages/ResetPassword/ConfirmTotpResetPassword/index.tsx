/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Dispatch, SetStateAction, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import protectionShieldIcon from '@fxa/shared/assets/images/protection-shield.svg';
import FormVerifyCode, {
  commonBackupCodeFormAttributes,
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { HeadingPrimary } from '../../../components/HeadingPrimary';

export type ConfirmTotpResetPasswordProps = {
  verifyCode: (code: string) => Promise<void>;
  verifyRecoveryCode: (code: string) => Promise<void>;
  codeErrorMessage: string;
  setCodeErrorMessage: Dispatch<SetStateAction<string>>;
};

const ConfirmTotpResetPassword = ({
  verifyCode,
  verifyRecoveryCode,
  codeErrorMessage,
  setCodeErrorMessage,
}: ConfirmTotpResetPasswordProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [showRecoveryCode, setShowRecoveryCode] = useState<boolean>(false);

  const totpFormAttributes: FormAttributes = {
    inputFtlId: 'confirm-totp-reset-password-input-label-v2',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'confirm-totp-reset-password-confirm-button',
    submitButtonText: 'Confirm',
  };

  const recoveryCodeFormAttributes: FormAttributes = {
    inputFtlId: 'confirm-recovery-code-reset-password-input-label',
    inputLabelText: 'Enter 10-character code',
    submitButtonFtlId: 'confirm-totp-reset-password-confirm-button',
    submitButtonText: 'Confirm',
    ...commonBackupCodeFormAttributes,
  };

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-totp-code-required-error',
    'Authentication code required'
  );

  return (
    <>
      {showRecoveryCode ? (
        <AppLayout cardClass="card-base">
          <FtlMsg id="confirm-totp-reset-password-header">
            <HeadingPrimary>Reset your password</HeadingPrimary>
          </FtlMsg>

          <h2 className="font-bold text-xl">
            <FtlMsg id="confirm-totp-reset-password-subheader">
              Enter your backup recovery code
            </FtlMsg>
          </h2>

          <div className="flex space-x-4">
            <img src={protectionShieldIcon} alt="" />
            <p className="my-5 text-md">
              <FtlMsg id="confirm-totp-reset-password-instruction">
                Check your download or saved backup recovery code.
              </FtlMsg>
            </p>
          </div>

          <FormVerifyCode
            {...{
              formAttributes: recoveryCodeFormAttributes,
              verifyCode: verifyRecoveryCode,
              localizedCustomCodeRequiredMessage,
              viewName: 'confirm-recovery-code-reset-password',
              codeErrorMessage,
              setCodeErrorMessage,
              gleanDataAttrs: {
                id: 'reset_password_confirm_recovery_code_submit_button',
              },
            }}
          />
          <div className="mt-5 link-blue text-sm flex justify-end">
            <div
              onClick={() => {
                setShowRecoveryCode(false);
              }}
              data-glean-id="reset_password_confirm_recovery_code_trouble_with_code_button"
            >
              <FtlMsg id="confirm-recovery-code-reset-password-trouble-code">
                Back
              </FtlMsg>
            </div>
          </div>
        </AppLayout>
      ) : (
        <AppLayout cardClass="card-base">
          <FtlMsg id="confirm-totp-reset-password-header">
            <HeadingPrimary>Reset your password</HeadingPrimary>
          </FtlMsg>

          <h2 className="font-bold text-xl">
            <FtlMsg id="confirm-totp-reset-password-subheader-v2">
              Enter two-step authentication code
            </FtlMsg>
          </h2>

          <div className="flex space-x-4">
            <img src={protectionShieldIcon} alt="" />
            <FtlMsg id="confirm-totp-reset-password-instruction-v2">
              <p className="my-5 text-md">
                Check your <strong>authenticator app</strong> to reset your
                password.
              </p>
            </FtlMsg>
          </div>

          <FormVerifyCode
            {...{
              formAttributes: totpFormAttributes,
              verifyCode,
              localizedCustomCodeRequiredMessage,
              codeErrorMessage,
              setCodeErrorMessage,
              viewName: 'confirm-totp-reset-password',
              gleanDataAttrs: {
                id: 'reset_password_confirm_totp_code_submit_button',
              },
            }}
          />
          <div className="mt-5 flex justify-between items-center">
            <button
              className="link-blue text-sm"
              data-glean-id="reset_password_confirm_totp_use_different_account_button"
              onClick={() => {
                // Navigate to email first page and keep search params
                hardNavigate('/', {}, true);
              }}
            >
              <FtlMsg id="confirm-totp-reset-password-use-different-account">
                Use different account
              </FtlMsg>
            </button>
            <button
              className="link-blue text-sm"
              onClick={() => {
                setShowRecoveryCode(true);
              }}
              data-glean-id="reset_password_confirm_totp_trouble_with_code_button"
            >
              <FtlMsg id="confirm-totp-reset-password-trouble-code">
                Trouble entering code?
              </FtlMsg>
            </button>
          </div>
        </AppLayout>
      )}
    </>
  );
};

export default ConfirmTotpResetPassword;
