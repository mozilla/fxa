/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import FormVerifyTotp from '../../../components/FormVerifyTotp';
import { ConfirmResetPasswordProps } from './interfaces';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useFtlMsgResolver } from '../../../models';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import Banner, {
  BannerType,
  ResendEmailSuccessBanner,
} from '../../../components/Banner';
import { ResendStatus } from '../../../lib/types';
import { EmailCodeImage } from '../../../components/images';
import GleanMetrics from '../../../lib/glean';

const ConfirmResetPassword = ({
  email,
  errorMessage,
  setErrorMessage,
  resendCode,
  resendStatus,
  resendErrorMessage,
  verifyCode,
}: ConfirmResetPasswordProps & RouteComponentProps) => {
  useEffect(() => {
    GleanMetrics.passwordReset.emailConfirmationView();
  }, []);

  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();

  const localizedInputGroupLabel = ftlMsgResolver.getMsg(
    'confirm-reset-password-code-input-group-label',
    'Enter 8-digit code within 10 minutes'
  );
  const localizedSubmitButtonText = ftlMsgResolver.getMsg(
    'confirm-reset-password-otp-submit-button',
    'Continue'
  );

  const spanElement = <span className="font-bold">{email}</span>;

  const hasResendError = !!(
    resendStatus === ResendStatus.error && resendErrorMessage
  );

  const signinClickHandler = () => {
    GleanMetrics.passwordReset.emailConfirmationSignin();
  };

  return (
    <AppLayout>
      <FtlMsg id="password-reset-flow-heading">
        <p className="text-start text-grey-400 text-sm">Reset your password</p>
      </FtlMsg>
      <EmailCodeImage className="mx-auto" />
      <FtlMsg id="confirm-reset-password-with-code-heading">
        <h2 className="card-header text-start my-4">Check your email</h2>
      </FtlMsg>
      <FtlMsg
        id="confirm-reset-password-with-code-instruction"
        vars={{ email }}
        elems={{ span: spanElement }}
      >
        <p className="text-start">
          We sent a confirmation code to {spanElement}.
        </p>
      </FtlMsg>
      {resendStatus === ResendStatus.sent && <ResendEmailSuccessBanner />}
      {hasResendError && (
        <Banner type={BannerType.error}>{resendErrorMessage}</Banner>
      )}
      <FormVerifyTotp
        codeLength={8}
        {...{
          errorMessage,
          localizedInputGroupLabel,
          localizedSubmitButtonText,
          setErrorMessage,
          verifyCode,
        }}
      />
      <LinkRememberPassword {...{ email }} clickHandler={signinClickHandler} />
      <div className="flex justify-between mt-8 text-sm">
        <FtlMsg id="confirm-reset-password-otp-resend-code-button">
          <button type="button" className="link-blue" onClick={resendCode}>
            Resend code
          </button>
        </FtlMsg>
        <FtlMsg id="confirm-reset-password-otp-different-account-link">
          <a
            href="/"
            className="text-sm link-blue"
            onClick={(e) => {
              e.preventDefault();
              GleanMetrics.passwordReset.emailConfirmationDifferentAccount();
              const params = new URLSearchParams(location.search);
              // Tell content-server to stay on index and prefill the email
              params.set('prefillEmail', email);
              // Passing back the 'email' param causes various behaviors in
              // content-server since it marks the email as "coming from a RP".
              // Also remove other params that are passed when coming
              // from content-server to Backbone, see Signup container component
              // for more info.
              params.delete('email');
              params.delete('hasLinkedAccount');
              params.delete('hasPassword');
              params.delete('showReactApp');
              hardNavigate(`/?${params.toString()}`);
            }}
          >
            Use a different account
          </a>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default ConfirmResetPassword;
