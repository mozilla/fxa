/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from '@reach/router';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { useAccount, useAlertBar } from '../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models/hooks';

import { InputText } from '../../components/InputText';
import CardHeader from '../../components/CardHeader';
import WarningMessage from '../../components/WarningMessage';
import LinkRememberPassword from '../../components/LinkRememberPassword';

// --forceEmail-- is a hint to the signup page that the user should not
// be given the option to change their address
// can be triggered by clicking on "Forgot password?" from /force_auth?email=user@domain.com
// where the provided email is a registered account
// (e.g., if coming from force_auth or a relying party)

// --canGoBack-- determines if the user can navigate back to an fxa entrypoint

// --serviceName-- is the relying party

export type ResetPasswordProps = {
  serviceName?: string;
  forceEmail?: string;
  canGoBack?: boolean;
};

type FormData = {
  email: string;
};

// eslint-disable-next-line no-empty-pattern
const ResetPassword = ({
  serviceName,
  forceEmail,
  canGoBack,
}: ResetPasswordProps & RouteComponentProps) => {
  usePageViewEvent('reset-password', {
    entrypoint_variation: 'react',
  });

  const [email, setEmail] = useState<string>(forceEmail || '');
  const [emailErrorText, setEmailErrorText] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const alertBar = useAlertBar();
  const account = useAccount();
  const navigate = useNavigate();
  const onFocusMetricsEvent = 'reset-password.engage';
  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    // The email field is not pre-filled for the reset_password page,
    // but if the user enters an email address, the entered email
    // address should be propagated back to the signin page. If
    // the user enters no email and instead clicks "Remember password?"
    // immediately, the /signin page should have the original email.
    // See https://github.com/mozilla/fxa-content-server/issues/5293.
    defaultValues: {
      email: '',
    },
  });

  const onFocus = () => {
    if (!isFocused && onFocusMetricsEvent) {
      logViewEvent('flow', onFocusMetricsEvent, {
        entrypoint_variation: 'react',
      });
      setIsFocused(true);
    }
  };

  const navigateToConfirmPwReset = useCallback(() => {
    navigate('confirm_reset_password', { replace: true });
  }, [navigate]);

  // Set tooltip error message
  // const setErrorMessage = (errorText: string) => {
  //   setEmailErrorText(errorText);
  // };

  // --TODO: Complete onSubmit handling in FXA-6123--
  // Verify if provided email is linked to existing account
  // If yes, logViewEvent (reset-password.submit),
  // initiate password reset and send password reset link by email
  // Navigate to confirm_reset_password
  // Catch errors:
  // If 'UNKNOWN_ACCOUNT' --> tooltip ('Unknown account. Sign up' w/link), log error
  // If USER_CANCELLED_LOGIN --> log error (login.cancelled)
  // If other error --> alertBar, ''Sorry, there was a problem resetting your password'
  const onSubmit = () => {
    try {
      // TODO resetPassword function in FXA-6123
      account.resetPassword(email);
      navigateToConfirmPwReset();
    } catch (e) {
      const errorResetPassword = ftlMsgResolver.getMsg(
        'reset-password-error-general',
        'Sorry, there was a problem resetting your password'
      );
      alertBar.error(errorResetPassword);
    }
  };

  return (
    <>
      <CardHeader
        headingWithDefaultServiceFtlId="reset-password-heading-w-default-service"
        headingWithCustomServiceFtlId="reset-password-heading-w-custom-service"
        headingText="Reset password"
        {...{ serviceName }}
      />

      <WarningMessage
        warningMessageFtlId="reset-password-warning-message"
        warningType="Note:"
      >
        When you reset your password, you reset your account. You may lose some
        of your personal information (including history, bookmarks, and
        passwords). That’s because we encrypt your data with your password to
        protect your privacy. You’ll still keep any subscriptions you may have
        and Pocket data will not be affected.
      </WarningMessage>

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
        data-testid="reset-password-form"
      >
        {/* if email is forced, display a read-only email */}
        {/* do not provide input field to modify the email */}
        {forceEmail && (
          <p
            data-testid="reset-password-force-email"
            className="text-base break-all"
          >
            {forceEmail}
          </p>
        )}

        {/* if email is not forced, display input field */}
        {!forceEmail && (
          <InputText
            type="email"
            label="Email"
            name="email"
            placeholder={'username@domain.com'}
            onChange={(e) => {
              setEmail(e.target.value);
              // clear error tooltip if user types in the field
              if (emailErrorText) {
                setEmailErrorText('');
              }
            }}
            onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
            autoFocus
            errorText={emailErrorText}
            className="text-start"
            anchorStart
            autoComplete="off"
            spellCheck={false}
            prefixDataTestId="reset-password"
          />
        )}

        <FtlMsg id="reset-password-button">
          <button
            data-testid="reset-password-button"
            type="submit"
            className="cta-primary cta-xl"
          >
            Begin Reset
          </button>
        </FtlMsg>
      </form>

      {canGoBack && !forceEmail && <LinkRememberPassword {...{ email }} />}
      {canGoBack && forceEmail && <LinkRememberPassword {...{ forceEmail }} />}
    </>
  );
};

export default ResetPassword;
