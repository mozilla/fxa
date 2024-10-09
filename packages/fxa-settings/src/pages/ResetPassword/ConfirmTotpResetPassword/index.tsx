/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Dispatch, SetStateAction, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import protectionShieldIcon from '@fxa/shared/assets/images/protection-shield.svg';
import FormVerifyCode, {
  FormAttributes,
  InputModeEnum,
} from '../../../components/FormVerifyCode';

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
    inputFtlId: 'confirm-totp-reset-password-input-label',
    inputLabelText: 'Enter code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'confirm-totp-reset-password-confirm-button',
    submitButtonText: 'Confirm',
  };

  const recoveryCodeFormAttributes: FormAttributes = {
    inputFtlId: 'confirm-recovery-code-reset-password-input-label',
    inputLabelText: 'Enter 10-digit backup authentication code',
    inputMode: InputModeEnum.text,
    pattern: '[a-zA-Z0-9]',
    maxLength: 10,
    submitButtonFtlId: 'confirm-totp-reset-password-confirm-button',
    submitButtonText: 'Confirm',
  };

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-totp-code-required-error',
    'Authentication code required'
  );

  return (
    <>
      {showRecoveryCode ? (
        <AppLayout cardClass="card-base">
          <h1 className="text-grey-400 mb-6 text-start">
            <FtlMsg id="confirm-totp-reset-password-header">
              Reset your password
            </FtlMsg>
          </h1>

          <h2 className="font-bold text-xl text-start">
            <FtlMsg id="confirm-totp-reset-password-subheader">
              Enter your backup recovery code
            </FtlMsg>
          </h2>

          <div className="flex space-x-4">
            <img src={protectionShieldIcon} alt="" />
            <FtlMsg id="confirm-totp-reset-password-instruction">
              <p className="my-5 text-md text-start">
                Check your download or saved backup recovery code.
              </p>
            </FtlMsg>
          </div>

          <FormVerifyCode
            {...{
              formAttributes: recoveryCodeFormAttributes,
              verifyCode: verifyRecoveryCode,
              localizedCustomCodeRequiredMessage,
              viewName: 'confirm-recovery-code-reset-password',
              codeErrorMessage,
              setCodeErrorMessage,
            }}
          />
          <div className="mt-5 link-blue text-sm flex justify-end">
            <FtlMsg id="confirm-recovery-code-reset-password-trouble-code">
              <div
                onClick={() => {
                  setShowRecoveryCode(false);
                }}
              >
                Back
              </div>
            </FtlMsg>
          </div>
        </AppLayout>
      ) : (
        <AppLayout cardClass="card-base">
          <h1 className="text-grey-400 mb-6 text-start">
            <FtlMsg id="confirm-totp-reset-password-header">
              Reset your password
            </FtlMsg>
          </h1>

          <h2 className="font-bold text-xl text-start">
            <FtlMsg id="confirm-totp-reset-password-subheader">
              Enter your two-factor authentication security code (2FA)
            </FtlMsg>
          </h2>

          <div className="flex space-x-4">
            <img src={protectionShieldIcon} alt="" />
            <FtlMsg id="confirm-totp-reset-password-instruction">
              <p className="my-5 text-md text-start">
                Check your authenticator app to reset your password.
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
            }}
          />
          <div className="mt-5 link-blue text-sm flex justify-end">
            <FtlMsg id="confirm-totp-reset-password-trouble-code">
              <button
                onClick={() => {
                  setShowRecoveryCode(true);
                }}
              >
                Trouble entering code?
              </button>
            </FtlMsg>
          </div>
        </AppLayout>
      )}
    </>
  );
};

export default ConfirmTotpResetPassword;
