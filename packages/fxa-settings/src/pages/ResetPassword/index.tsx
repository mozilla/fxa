/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { logViewEvent, logPageViewEvent } from '../../lib/metrics';
import { useAccount } from '../../models';

import { FtlMsg } from 'fxa-react/lib/utils';

import { InputText } from '../../components/InputText';
import CardHeader from '../../components/CardHeader';
import WarningMessage from '../../components/WarningMessage';
import LinkRememberPassword from '../../components/LinkRememberPassword';

import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';

import AppLayout from '../../components/AppLayout';
import { composeAuthUiErrorTranslationId } from '../../lib/auth-errors/auth-errors';
import Banner, { BannerType } from '../../components/Banner';
import { ConfirmResetPasswordProps } from './ConfirmResetPassword';

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

  const [email, setEmail] = useState<string>(prefillEmail || '');
  const [errorText, setErrorText] = useState<string>('');
  const [errorTranslationId, setErrorTranslationId] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const account = useAccount();
  const navigate = useNavigate();

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
    if (!isFocused) {
      logViewEvent('flow', `${viewName}.engage`, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  const navigateToConfirmPwReset = useCallback(
    (stateData: ConfirmResetPasswordProps) => {
      navigate('confirm_reset_password', { state: stateData, replace: true });
    },
    [navigate]
  );

  const onSubmit = async () => {
    try {
      setErrorTranslationId('');
      const result = await account.resetPassword(email);
      navigateToConfirmPwReset({
        passwordForgotToken: result.passwordForgotToken,
        email,
      });
    } catch (err) {
      setErrorTranslationId(composeAuthUiErrorTranslationId(err));
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

      {errorTranslationId && (
        <Banner type={BannerType.error}>
          <FtlMsg id={errorTranslationId}>
            <p>Sorry, there was a problem resetting your password</p>
          </FtlMsg>
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
          <InputText
            type="email"
            label="Email"
            name="email"
            placeholder={'username@domain.com'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              // clear error tooltip if user types in the field
              if (errorText) {
                setErrorText('');
              }
            }}
            onFocusCb={onFocus}
            autoFocus
            errorText={errorText}
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

      <LinkRememberPassword {...{ email }} />
    </AppLayout>
  );
};

export default ResetPassword;
