/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import { Control, useForm, useWatch } from 'react-hook-form';
import { useFtlMsgResolver } from '../../../models';

import { FtlMsg } from 'fxa-react/lib/utils';

import AppLayout from '../../../components/AppLayout';
import Banner, { BannerType } from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import { InputText } from '../../../components/InputText';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import { isEmailValid } from 'fxa-shared/email/helpers';
import { ResetPasswordFormData, ResetPasswordProps } from './interfaces';
import GleanMetrics from '../../../lib/glean';

export const viewName = 'reset-password';

// eslint-disable-next-line no-empty-pattern
const ResetPassword = ({
  errorMessage,
  requestResetPasswordCode,
  serviceName,
  setErrorMessage,
}: ResetPasswordProps & RouteComponentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ftlMsgResolver = useFtlMsgResolver();

  useEffect(() => {
    GleanMetrics.passwordReset.view();
  }, []);

  const { control, getValues, handleSubmit, register } =
    useForm<ResetPasswordFormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        email: '',
      },
    });

  const onSubmit = async () => {
    setIsSubmitting(true);
    // clear error messages
    setErrorMessage('');
    const email = getValues('email').trim();

    if (!email || !isEmailValid(email)) {
      setErrorMessage(
        ftlMsgResolver.getMsg('auth-error-1011', 'Valid email required')
      );
    } else {
      GleanMetrics.passwordReset.submit();
      await requestResetPasswordCode(email);
    }
    setIsSubmitting(false);
  };

  // using a controlled component updates the link target as the input field is updated
  // The email field is not pre-filled for the reset_password page,
  // but if the user enters an email address, the entered email
  // address should be propagated back to the signin page. If
  // the user enters no email and instead clicks "Remember your password? Sign in"
  // immediately, the /signin page should have the original email.
  // See https://github.com/mozilla/fxa-content-server/issues/5293.
  const ControlledLinkRememberPassword = ({
    control,
  }: {
    control: Control<ResetPasswordFormData>;
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
        headingText="Reset your password"
        headingTextFtlId="password-reset-start-heading"
      />

      {errorMessage && (
        <Banner type={BannerType.error}>
          <p>{errorMessage}</p>
        </Banner>
      )}

      <FtlMsg id="password-reset-body">
        <p className="my-6">
          Enter your email and we’ll send you a confirmation code to confirm
          it’s really you.
        </p>
      </FtlMsg>

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FtlMsg id="password-reset-email-input" attrs={{ label: true }}>
          <InputText
            type="email"
            label="Enter your email"
            name="email"
            onChange={() => setErrorMessage('')}
            autoFocus
            autoComplete="username"
            spellCheck={false}
            inputRef={register()}
          />
        </FtlMsg>

        <FtlMsg id="password-reset-submit-button">
          <button
            type="submit"
            className="cta-primary cta-xl"
            disabled={isSubmitting}
          >
            Send me reset instructions
          </button>
        </FtlMsg>
      </form>

      <ControlledLinkRememberPassword {...{ control }} />
    </AppLayout>
  );
};

export default ResetPassword;
