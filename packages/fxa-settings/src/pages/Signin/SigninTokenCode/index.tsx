/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { /* useAccount, */ useFtlMsgResolver } from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
import { MailImage } from '../../../components/images';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
// import { ResendStatus } from "fxa-settings/src/lib/types";
// import { ResendLinkErrorBanner, ResendEmailSuccessBanner } from "fxa-settings/src/components/Banner";

// email will eventually be obtained from account context
export type SigninTokenCodeProps = { email: string };

export const viewName = 'signin-token-code';

const SigninTokenCode = ({
  email,
}: SigninTokenCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  // const account = useAccount();

  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  // const [resendStatus, setResendStatus] = useState<ResendStatus>(
  //   ResendStatus['not sent']
  // );

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-token-code-required-error',
    'Confirmation code required'
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-token-code-input-label-v2',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'signin-token-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  const handleResendCode = async () => {
    // try {
    // TODO: add resend code action
    //   await account.verifySessionResendCode();
    //   setResendStatus(ResendStatus['sent']);
    // } catch (e) {
    //   setResendStatus(ResendStatus['error']);
    // }
  };

  const onSubmit = () => {
    try {
      // Check confirmation code
      // Log success event
      // Check if isForcePasswordChange
    } catch (e) {
      // TODO: error handling, error message confirmation
      // this should likely use auth-errors and display in a tooltip or banner
    }
  };

  return (
    // TODO: redirect to force_auth or signin if user has not initiated sign in

    // TODO: handle bounced email
    //       if the account no longer exists, redirect to sign up
    //       if the account exists, notify that the account has been blocked
    //       and provide correct support link
    <>
      <CardHeader
        headingText="Enter confirmation code"
        headingAndSubheadingFtlId="signin-token-code-heading-2"
      />

      {/* {resendStatus === ResendStatus["sent"] && <ResendEmailSuccessBanner />}
      {resendStatus === ResendStatus["error"] && <ResendCodeErrorBanner />} */}

      <div className="flex justify-center mx-auto">
        <MailImage className="w-3/5" />
      </div>

      <FtlMsg id="signin-token-code-instruction" vars={{ email }}>
        <p id="verification-email-message" className="m-5 text-sm">
          Enter the code that was sent to {email} within 5 minutes.
        </p>
      </FtlMsg>

      <FormVerifyCode
        {...{
          formAttributes,
          viewName,
          verifyCode: onSubmit,
          localizedCustomCodeRequiredMessage,
          codeErrorMessage,
          setCodeErrorMessage,
        }}
      />

      <div className="animate-delayed-fade-in opacity-0 mt-5 text-grey-500 text-xs inline-flex gap-1">
        <FtlMsg id="signin-token-code-code-expired">
          <p>Code expired?</p>
        </FtlMsg>
        <FtlMsg id="signin-token-code-resend-code-link">
          <button id="resend" className="link-blue" onClick={handleResendCode}>
            Email new code.
          </button>
        </FtlMsg>
      </div>
    </>
  );
};

export default SigninTokenCode;
