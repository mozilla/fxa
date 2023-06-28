/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate } from '@reach/router';
import React, { useCallback, useEffect, useState } from 'react';
import { Control, useForm, useWatch } from 'react-hook-form';
import { REACT_ENTRYPOINT } from '../../constants';
import { usePageViewEvent, useMetrics } from '../../lib/metrics';
import { MozServices } from '../../lib/types';
import { CreateRelier, useFtlMsgResolver } from '../../models';

import { FtlMsg } from 'fxa-react/lib/utils';

import AppLayout from '../../components/AppLayout';
import Banner, { BannerType } from '../../components/Banner';
import CardHeader from '../../components/CardHeader';
import { ConfirmResetPasswordLocationState } from './ConfirmResetPassword';
import { InputText } from '../../components/InputText';
import LinkRememberPassword from '../../components/LinkRememberPassword';
import WarningMessage from '../../components/WarningMessage';
import { isEmailValid } from 'fxa-shared/email/helpers';
import {
  BeginResetPasswordHandler,
  BeginResetPasswordResult,
} from './container';

export const viewName = 'reset-password';

export type ResetPasswordProps = {
  prefillEmail?: string;
  forceAuth?: boolean;
  serviceName?: MozServices;
  beginResetPasswordHandler: BeginResetPasswordHandler;
  beginResetPasswordResult: BeginResetPasswordResult;
};

type FormData = {
  email: string;
};

const sanitizeEmail = (email: string) => email.trim();

// eslint-disable-next-line no-empty-pattern
const ResetPassword = ({
  prefillEmail,
  forceAuth,
  beginResetPasswordHandler,
  beginResetPasswordResult,
}: ResetPasswordProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [errorText, setErrorText] = useState<string>('');
  const [bannerErrorText, setBannerErrorText] = useState<string>('');
  const [hasFocused, setHasFocused] = useState<boolean>(false);
  const relier = CreateRelier();
  const navigate = useNavigate();
  const ftlMsgResolver = useFtlMsgResolver();

  const serviceName = relier.getServiceName();

  const { control, getValues, handleSubmit, register } = useForm<FormData>({
    mode: 'onTouched',
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

  // Log a metrics event when a user first engages with the form
  const { logViewEventOnce: logEngageEvent } = useMetrics();
  const onFocus = useCallback(() => {
    if (!hasFocused) {
      logEngageEvent(viewName, 'engage', REACT_ENTRYPOINT);
      setHasFocused(true);
    }
  }, [hasFocused, logEngageEvent]);

  const navigateToConfirmPwReset = useCallback(
    (stateData: ConfirmResetPasswordLocationState) => {
      navigate('confirm_reset_password?showReactApp=true', {
        state: stateData,
        replace: true,
      });
    },
    [navigate]
  );

  const clearError = useCallback(() => {
    if (errorText !== '') {
      setErrorText('');
      setBannerErrorText('');
    }
  }, [errorText, setErrorText]);

  const submitEmail = useCallback(
    (email: string) => {
      clearError();
      beginResetPasswordHandler(email, serviceName);
    },
    [clearError, beginResetPasswordHandler, serviceName]
  );

  useEffect(() => {
    if (beginResetPasswordResult.data) {
      // ❌ This means submit was called and the result was returned successfully.
      // We do have to `navigateToConfirmPwReset` in a separate `useEffect`
      // because the result is passed in as a prop instead of being available
      // via `await`ing the API call.
      const email = sanitizeEmail(getValues('email'));
      const { passwordForgotToken } =
        beginResetPasswordResult.data.passwordForgotSendCode;
      navigateToConfirmPwReset({
        passwordForgotToken,
        email,
      });
    }
    if (beginResetPasswordResult.error) {
      const { message, ftlId, retryAfterLocalized } =
        beginResetPasswordResult.error;
      setBannerErrorText(
        ftlMsgResolver.getMsg(ftlId, message, {
          ...(retryAfterLocalized && { retryAfter: retryAfterLocalized }),
        })
      );
    }
  }, [
    beginResetPasswordResult.data,
    beginResetPasswordResult.error,
    ftlMsgResolver,
    navigateToConfirmPwReset,
    getValues,
  ]);

  const onSubmit = useCallback(async () => {
    const sanitizedEmail = sanitizeEmail(getValues('email'));
    if (sanitizedEmail === '') {
      setErrorText(
        ftlMsgResolver.getMsg(
          'reset-password-email-required-error',
          'Email required'
        )
      );
      return;
    } else if (!isEmailValid(sanitizedEmail)) {
      setErrorText(
        ftlMsgResolver.getMsg('auth-error-1011', 'Valid email required')
      );
    } else {
      submitEmail(sanitizedEmail);
    }
  }, [ftlMsgResolver, getValues, submitEmail]);

  const ControlledLinkRememberPassword = ({
    control,
  }: {
    control: Control<FormData>;
  }) => {
    const email: string = useWatch({
      control,
      name: 'email',
      defaultValue: getValues().email,
    });
    return <LinkRememberPassword {...{ email }} />;
  };

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="reset-password-heading-w-default-service"
        headingWithCustomServiceFtlId="reset-password-heading-w-custom-service"
        headingText="Reset password"
        {...{ serviceName }}
      />

      {bannerErrorText && (
        <Banner type={BannerType.error}>
          <p>{bannerErrorText}</p>
        </Banner>
      )}

      <WarningMessage
        warningMessageFtlId="reset-password-warning-message-2"
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
        {forceAuth && prefillEmail && (
          <p
            data-testid="reset-password-force-email"
            className="text-base break-all"
          >
            {prefillEmail}
          </p>
        )}

        {/* if email is not forced, display input field */}
        {!forceAuth && (
          <FtlMsg id="reset-password-password-input" attrs={{ label: true }}>
            <InputText
              type="email"
              label="Email"
              name="email"
              onChange={clearError}
              onFocusCb={onFocus}
              autoFocus
              errorText={errorText}
              className="text-start"
              anchorStart
              autoComplete="off"
              spellCheck={false}
              prefixDataTestId="reset-password"
              inputRef={register}
            />
          </FtlMsg>
        )}

        <FtlMsg id="reset-password-button">
          <button
            data-testid="reset-password-button"
            type="submit"
            className="cta-primary cta-xl"
            // ❌ Let's be more consistent with our loading disabled button states
            // and loading spinners
            disabled={beginResetPasswordResult.loading}
          >
            Begin reset
          </button>
        </FtlMsg>
      </form>

      <ControlledLinkRememberPassword {...{ control }} />
    </AppLayout>
  );
};

export default ResetPassword;
