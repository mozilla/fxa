/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps } from '@reach/router';
import InputText from '../../../components/InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { ReactComponent as MailImg } from './graphic_mail.svg';

// email will eventually be obtained from account context
export type SigninTokenCodeProps = { email: string };

type FormData = {
  confirmationCode: string;
};

const SigninTokenCode = ({
  email,
}: SigninTokenCodeProps & RouteComponentProps) => {
  usePageViewEvent('signin-token-code', {
    entrypoint_variation: 'react',
  });

  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  // const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const onFocusMetricsEvent = 'signin-token-code.engage';

  const onFocus = () => {
    if (!isFocused && onFocusMetricsEvent) {
      logViewEvent('flow', onFocusMetricsEvent, {
        entrypoint_variation: 'react',
      });
      setIsFocused(true);
    }
  };

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      confirmationCode: '',
    },
  });

  const handleResendCode = () => {
    // TODO: add resend code action
    // account.verifySessionResendCode()
    // if success, display alert bar message
    // 'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
  };

  const onSubmit = () => {
    if (!confirmationCode) {
      const codeRequiredError = ftlMsgResolver.getMsg(
        'signin-token-code-required-error',
        'Confirmation code required'
      );
      setTokenErrorMessage(codeRequiredError);
    }
    try {
      // Check confirmation code
      // Log success event
      // Check if isForcePasswordChange
    } catch (e) {
      // TODO: error handling, error message confirmation
      // const errorSigninTokenCode = ftlMsgResolver.getMsg(
      //   'signin-token-code-error',
      //   'Incorrect confirmation code'
      // );
      // alertBar.error(errorSigninTokenCode);
    }
  };

  return (
    // TODO: redirect to force_auth or signin if user has not initiated sign in

    // TODO: handle bounced email
    //       if the account no longer exists, redirect to sign up
    //       if the account exists, notify that the account has been blocked
    //       and provide correct support link
    <>
      <header>
        <FtlMsg id="signin-token-code-heading">
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

        <FtlMsg id="signin-token-code-instruction">
          <p id="verification-email-message" className="m-5 text-sm">
            Enter the code that was sent to {email} within 5 minutes.
          </p>
        </FtlMsg>

        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Using `type="text" inputmode="numeric"` shows the numeric pad on mobile and strips out whitespace on desktop. */}
          <FtlMsg id="signin-token-code-input-label">
            <InputText
              type="text"
              inputMode="numeric"
              label="Enter 6-digit code"
              onChange={(e) => {
                setConfirmationCode(e.target.value);
                // clear error tooltip if user types in the field
                if (tokenErrorMessage) {
                  setTokenErrorMessage('');
                }
              }}
              onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
              errorText={tokenErrorMessage}
              autoFocus
              // TODO: validate pattern
              pattern="\d[ ]*"
              className="text-start"
              anchorStart
              autoComplete="off"
              spellCheck={false}
              prefixDataTestId="signin-token-code"
              required
              tooltipPosition="bottom"
            />
          </FtlMsg>

          <FtlMsg id="signin-token-code-confirm-button">
            <button
              type="submit"
              id="use-logged-in"
              className="cta-primary cta-xl"
            >
              Confirm
            </button>
          </FtlMsg>
        </form>
        <div className="animate-delayed-fade-in opacity-0 mt-5 text-grey-500 text-xs inline-flex gap-1">
          <FtlMsg id="signin-token-code-code-expired">
            <p>Code expired?</p>
          </FtlMsg>
          <FtlMsg id="signin-token-code-resend-code-link">
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

export default SigninTokenCode;
