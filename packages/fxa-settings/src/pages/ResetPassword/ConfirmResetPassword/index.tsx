/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import FormVerifyTotp from '../../../components/FormVerifyTotp';
import { ConfirmResetPasswordProps } from './interfaces';
import { RouteComponentProps } from '@reach/router';
import { useFtlMsgResolver } from '../../../models';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ResendStatus } from '../../../lib/types';
import { EmailCodeImage } from '../../../components/images';
import GleanMetrics from '../../../lib/glean';
import Banner, { ResendCodeSuccessBanner } from '../../../components/Banner';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

const ConfirmResetPassword = ({
  clearBanners,
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
  const navigateWithQuery = useNavigateWithQuery();

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
        <HeadingPrimary marginClass="">Reset your password</HeadingPrimary>
      </FtlMsg>
      {resendStatus === ResendStatus.sent && !hasResendError && (
        <ResendCodeSuccessBanner />
      )}
      {hasResendError && (
        <Banner
          type="error"
          content={{ localizedHeading: resendErrorMessage }}
        />
      )}
      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}
      <EmailCodeImage />
      <FtlMsg id="confirm-reset-password-with-code-heading">
        <h2 className="card-header my-4">Check your email</h2>
      </FtlMsg>
      <FtlMsg
        id="confirm-reset-password-with-code-instruction"
        vars={{ email }}
        elems={{ span: spanElement }}
      >
        <p>We sent a confirmation code to {spanElement}.</p>
      </FtlMsg>
      <FormVerifyTotp
        codeLength={8}
        codeType="numeric"
        localizedInputLabel={ftlMsgResolver.getMsg(
          'confirm-reset-password-code-input-group-label',
          'Enter 8-digit code within 10 minutes'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'confirm-reset-password-otp-submit-button',
          'Continue'
        )}
        {...{
          clearBanners,
          errorMessage,
          setErrorMessage,
          verifyCode,
        }}
        className="my-6"
      />
      <LinkRememberPassword {...{ email }} clickHandler={signinClickHandler} />
      <div className="flex justify-between mt-5 text-sm">
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

              navigateWithQuery('/', {
                state: {
                  prefillEmail: email,
                },
              });
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
