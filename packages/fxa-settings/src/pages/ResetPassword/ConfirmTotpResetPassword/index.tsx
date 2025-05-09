/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Dispatch, SetStateAction } from 'react';
import AppLayout from '../../../components/AppLayout';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import protectionShieldIcon from '@fxa/shared/assets/images/protection-shield.svg';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import Banner from '../../../components/Banner';
import FormVerifyTotp from '../../../components/FormVerifyTotp';

export type ConfirmTotpResetPasswordProps = {
  verifyCode: (code: string) => Promise<void>;
  codeErrorMessage: string;
  setCodeErrorMessage: Dispatch<SetStateAction<string>>;
  onTroubleWithCode: () => void;
};

const ConfirmTotpResetPassword = ({
  verifyCode,
  codeErrorMessage,
  setCodeErrorMessage,
  onTroubleWithCode,
}: ConfirmTotpResetPasswordProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  return (
    <AppLayout>
      <FtlMsg id="confirm-totp-reset-password-header">
        <HeadingPrimary>Reset your password</HeadingPrimary>
      </FtlMsg>

      {codeErrorMessage && (
        <Banner
          type="error"
          content={{
            localizedHeading: codeErrorMessage,
          }}
          bannerId="confirm-totp-reset-password-error-banner"
        />
      )}

      <h2 className="font-bold text-xl mb-4">
        <FtlMsg id="confirm-totp-reset-password-subheader-v2">
          Enter two-step authentication code
        </FtlMsg>
      </h2>

      <div className="flex gap-4">
        <img src={protectionShieldIcon} alt="" />
        <FtlMsg id="confirm-totp-reset-password-instruction-v2">
          <p className="text-md">
            Check your <strong>authenticator app</strong> to reset your
            password.
          </p>
        </FtlMsg>
      </div>

      <FormVerifyTotp
        codeLength={6}
        codeType={'numeric'}
        errorMessage={codeErrorMessage}
        clearBanners={() => setCodeErrorMessage('')}
        setErrorMessage={setCodeErrorMessage}
        localizedInputLabel={ftlMsgResolver.getMsg(
          'confirm-totp-reset-password-input-label-v2',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'confirm-totp-reset-password-confirm-button',
          'Confirm'
        )}
        verifyCode={verifyCode}
        gleanDataAttrs={{
          id: 'reset_password_confirm_totp_code_submit_button',
        }}
        errorBannerId="confirm-totp-reset-password-error-banner"
      />

      <div className="mt-5 flex justify-between items-center">
        <button
          className="link-blue text-sm"
          data-glean-id="reset_password_confirm_totp_use_different_account_button"
          onClick={() => {
            navigateWithQuery('/');
          }}
        >
          <FtlMsg id="confirm-totp-reset-password-use-different-account">
            Use different account
          </FtlMsg>
        </button>
        <button
          className="link-blue text-sm"
          onClick={onTroubleWithCode}
          data-glean-id="reset_password_confirm_totp_trouble_with_code_button"
        >
          <FtlMsg id="confirm-totp-reset-password-trouble-code">
            Trouble entering code?
          </FtlMsg>
        </button>
      </div>
    </AppLayout>
  );
};

export default ConfirmTotpResetPassword;
