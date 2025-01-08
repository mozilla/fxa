/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../../components/AppLayout';
import FormVerifyTotp from '../../../components/FormVerifyTotp';
import { RouteComponentProps } from '@reach/router';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { BackupRecoveryPhoneCodeImage } from '../../../components/images';
import Banner from '../../../components/Banner';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import LinkExternal from 'fxa-react/components/LinkExternal';
import ButtonBack from '../../../components/ButtonBack';

export type SigninRecoveryPhoneCodeConfirmProps = {
  clearBanners?: () => void;
  maskedPhoneNumber: string;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
};

const SigninRecoveryPhoneCodeConfirm = ({
  clearBanners,
  maskedPhoneNumber,
  errorMessage,
  setErrorMessage,
  verifyCode,
  resendCode,
}: SigninRecoveryPhoneCodeConfirmProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const spanElement = <span className="font-bold">{maskedPhoneNumber}</span>;

  return (
    <AppLayout>
      <div className="relative flex items-start">
        <ButtonBack />
        <FtlMsg id="signin-recovery-method-header">
          <HeadingPrimary>Sign in</HeadingPrimary>
        </FtlMsg>
      </div>

      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}
      <BackupRecoveryPhoneCodeImage />
      <FtlMsg id="confirm-recovery-code-with-code-heading">
        <h2 className="card-header my-4">Enter recovery code</h2>
      </FtlMsg>
      <FtlMsg
        id="confirm-recovery-code-with-code-instruction"
        vars={{ maskedPhoneNumber }}
        elems={{ span: spanElement }}
      >
        <p>
          A six-digit code was sent to {spanElement} by text message. This code
          expires after 5 minutes.
        </p>
      </FtlMsg>
      <FormVerifyTotp
        codeLength={6}
        codeType="numeric"
        localizedInputLabel={ftlMsgResolver.getMsg(
          'confirm-recovery-code-code-input-group-label',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'confirm-recovery-code-otp-submit-button',
          'Confirm'
        )}
        {...{
          clearBanners,
          errorMessage,
          setErrorMessage,
          verifyCode,
        }}
      />
      <div className="flex justify-between mt-5 text-sm">
        <FtlMsg id="confirm-recovery-code-otp-resend-code-button">
          <button
            className="link-blue mt-4 text-sm"
            data-glean-id="login_backup_phone_codes_resend"
            onClick={resendCode}
          >
            Resend code
          </button>
        </FtlMsg>
        <FtlMsg id="confirm-recovery-code-otp-different-account-link">
          <LinkExternal
            href="https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication"
            className="link-blue mt-4 text-sm"
            data-glean-id="login_backup_phone_locked_out_link"
          >
            Are you locked out?
          </LinkExternal>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninRecoveryPhoneCodeConfirm;
