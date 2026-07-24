/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useFtlMsgResolver } from '../../../models';

import { FtlMsg } from 'fxa-react/lib/utils';

import AppLayout from '../../../components/AppLayout';
import { InputText } from '../../../components/InputText';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import { isEmailValid } from 'fxa-shared/email/helpers';
import { ResetPasswordFormData, ResetPasswordProps } from './interfaces';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';

export const viewName = 'reset-password';

// eslint-disable-next-line no-empty-pattern
const ResetPassword = ({
  errorMessage,
  requestResetPasswordCode,
  serviceName,
  setErrorMessage,
  setCurrentSplitLayout,
  showPasskeyOption,
}: ResetPasswordProps) => {
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

  // Read at the top level (not an inner component) so the footer doesn't remount
  // and re-fire its view metric on each render.
  const rememberPasswordEmail = useWatch({
    control,
    name: 'email',
    defaultValue: getValues().email,
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

  return (
    <AppLayout {...{ setCurrentSplitLayout }}>
      <FtlMsg id="password-reset-flow-heading">
        <h1 className="card-header">Reset your password</h1>
      </FtlMsg>

      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}

      <FtlMsg id="password-reset-body-3">
        <p className="mt-2 mb-6">
          Resetting your password may affect synced browser data.
        </p>
      </FtlMsg>

      <form
        noValidate
        className="flex flex-col gap-4 mb-5"
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

        <FtlMsg id="password-reset-submit-button-2">
          <button
            type="submit"
            className="cta-primary cta-xl"
            disabled={isSubmitting}
          >
            Continue
          </button>
        </FtlMsg>
      </form>

      <LinkRememberPassword
        textStart
        entrypoint="reset_password"
        email={rememberPasswordEmail}
        showPasskeyOption={showPasskeyOption}
      />
    </AppLayout>
  );
};

export default ResetPassword;
