/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';
import { usePageViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { ReactComponent as MailImg } from './graphic_mail.svg';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';

// email will eventually be obtained from account context
export type ConfirmSignupCodeProps = { email: string };

const ConfirmSignupCode = ({
  email,
}: ConfirmSignupCodeProps & RouteComponentProps) => {
  const viewName = 'confirm-signup-code';
  usePageViewEvent(viewName, {
    entrypoint_variation: 'react',
  });

  // const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();
  const [code, setCode] = useState<string>('');
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');

  const formAttributes: FormAttributes = {
    inputFtlId: 'confirm-signup-code-input-label',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'confirm-signup-code-submit-button',
    submitButtonText: 'Confirm',
  };

  const handleResendCode = () => {
    // TODO: add resend code action
    // account.verifySessionResendCode()
    // if success, display alert bar message
    // 'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
  };

  const onSubmit = () => {
    if (!code) {
      const codeRequiredError = ftlMsgResolver.getMsg(
        'confirm-signup-code-required-error',
        'Please enter confirmation code'
      );
      setCodeErrorMessage(codeRequiredError);
    }
    try {
      // Check confirmation code
      // Log success event (verification.success)
      // Display success message
      // Handle newsletter subscription
    } catch (e) {
      // TODO: error handling, error message confirmation
      // Possible AuthErrors to display in tooltip:
      //   - 'INVALID_EXPIRED_SIGNUP_CODE' = 'Invalid or expired confirmation code'
      //   - 'OTP_CODE_REQUIRED' = 'Please enter confirmation code'
      //   - 'INVALID_OTP_CODE' = 'Valid code required'
      // all other errors: alertBar.error(errorConfirmSignupCode);
    }
  };

  return (
    // the view is always rendered, but the confirmation may be
    // prevented by the broker.

    // TODO: handle bounced email
    //       if the account no longer exists, redirect to sign up
    //       if the account exists, notify that the account has been blocked
    //       and provide correct support link
    <>
      <header>
        <FtlMsg id="confirm-signup-code-heading">
          <h1 className="card-header">
            Enter confirmation code
            <span className="card-subheader"> for your Firefox account</span>
          </h1>
        </FtlMsg>
      </header>

      <main>
        <div className="flex justify-center mx-auto">
          <MailImg className="w-3/5" role="img" />
        </div>

        <FtlMsg id="confirm-signup-code-instruction">
          <p className="m-5 text-sm">
            Enter the code that was sent to {email} within 5 minutes.
          </p>
        </FtlMsg>

        <FormVerifyCode
          {...{
            formAttributes,
            viewName,
            email,
            onSubmit,
            code,
            setCode,
            codeErrorMessage,
            setCodeErrorMessage,
          }}
        />

        <div className="animate-delayed-fade-in opacity-0 mt-5 text-grey-500 text-xs inline-flex gap-1">
          <FtlMsg id="confirm-signup-code-code-expired">
            <p>Code expired?</p>
          </FtlMsg>
          <FtlMsg id="confirm-signup-code-resend-code-link">
            <button
              id="resend"
              className="link-blue"
              onClick={handleResendCode}
            >
              Email new code.
            </button>
          </FtlMsg>
        </div>
      </main>
    </>
  );
};

export default ConfirmSignupCode;
