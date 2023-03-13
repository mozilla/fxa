/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { logViewEvent, logPageViewEvent } from '../../lib/metrics';
import { useAccount, useFtlMsgResolver } from '../../models';

import { FtlMsg, FtlMsgResolver } from 'fxa-react/lib/utils';

import { InputText } from '../../components/InputText';
import CardHeader from '../../components/CardHeader';
import WarningMessage from '../../components/WarningMessage';
import LinkRememberPassword from '../../components/LinkRememberPassword';

import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';

import AppLayout from '../../components/AppLayout';
import {
  AuthUiErrorNos,
  AuthUiErrors,
  composeAuthUiErrorTranslationId,
} from '../../lib/auth-errors/auth-errors';
import Banner, { BannerType } from '../../components/Banner';
import { ConfirmResetPasswordLocationState } from './ConfirmResetPassword';

export const viewName = 'reset-password';

export type ResetPasswordProps = {
  prefillEmail?: string;
  forceAuth?: boolean;
  serviceName?: MozServices;
};

type FormData = {
  email: string;
};

// eslint-disable-next-line no-empty-pattern
const ResetPassword = ({
  // TODO: Pull service name from Relier model FXA-6437
  serviceName = MozServices.Default,
  prefillEmail,
  forceAuth,
}: ResetPasswordProps & RouteComponentProps) => {
  logPageViewEvent(viewName, REACT_ENTRYPOINT);

  const [errorText, setErrorText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const account = useAccount();
  const navigate = useNavigate();
  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit, watch, register } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    // The email field is not pre-filled for the reset_password page,
    // but if the user enters an email address, the entered email
    // address should be propagated back to the signin page. If
    // the user enters no email and instead clicks "Remember password?"
    // immediately, the /signin page should have the original email.
    // See https://github.com/mozilla/fxa-content-server/issues/5293.
    defaultValues: {
      email: prefillEmail || '',
    },
  });

  const email = watch('email');

  const onFocus = () => {
    if (!isFocused) {
      logViewEvent('flow', `${viewName}.engage`, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  const navigateToConfirmPwReset = useCallback(
    (stateData: ConfirmResetPasswordLocationState) => {
      navigate('confirm_reset_password', { state: stateData, replace: true });
    },
    [navigate]
  );

  const onSubmit = async () => {
    try {
      setErrorMessage('');
      const result = await account.resetPassword(email);
      navigateToConfirmPwReset({
        passwordForgotToken: result.passwordForgotToken,
        email,
      });
    } catch (err) {
      let localizedError;
      if (err.errno === AuthUiErrors.THROTTLED.errno) {
        localizedError = ftlMsgResolver.getMsg(
          composeAuthUiErrorTranslationId(err),
          AuthUiErrorNos[err.errno].message,
          { retryAfter: err.retryAfterLocalized }
        );
      } else {
        localizedError = ftlMsgResolver.getMsg(
          composeAuthUiErrorTranslationId(err),
          err.message
        );
      }
      setErrorMessage(localizedError);
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="reset-password-heading-w-default-service"
        headingWithCustomServiceFtlId="reset-password-heading-w-custom-service"
        headingText="Reset password"
        {...{ serviceName }}
      />

      {errorMessage && (
        <Banner type={BannerType.error}>
          <p>{errorMessage}</p>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                // clear error tooltip if user types in the field
                if (errorText) {
                  setErrorText('');
                }
              }}
              onFocusCb={onFocus}
              errorText={errorText}
              className="text-start"
              anchorStart
              autoComplete="off"
              spellCheck={false}
              prefixDataTestId="reset-password"
              inputRef={register({
                required: true,
              })}
            />
          </FtlMsg>
        )}

        <FtlMsg id="reset-password-button">
          <button type="submit" className="cta-primary cta-xl">
            Begin Reset
          </button>
        </FtlMsg>
      </form>

      <LinkRememberPassword {...{ email }} />
    </AppLayout>
  );
};

export default ResetPassword;
