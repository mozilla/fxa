/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router';
import { useFtlMsgResolver } from '../../../models';

import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';

import AppLayout from '../../../components/AppLayout';
import { InputText } from '../../../components/InputText';
import { isEmailValid } from 'fxa-shared/email/helpers';
import { ResetPasswordFormData, ResetPasswordProps } from './interfaces';
import GleanMetrics from '../../../lib/glean';
import { useGleanView } from '../../../lib/glean/useGleanView';
import Banner from '../../../components/Banner';

export const viewName = 'reset-password';

const learnMoreUrl =
  'https://support.mozilla.org/kb/how-change-or-reset-your-mozilla-account-password';

// eslint-disable-next-line no-empty-pattern
const ResetPassword = ({
  errorMessage,
  requestResetPasswordCode,
  serviceName,
  setErrorMessage,
  setCurrentSplitLayout,
}: ResetPasswordProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const signInHref = `/${location.search}`;

  const ftlMsgResolver = useFtlMsgResolver();

  useGleanView(() => GleanMetrics.passwordReset.view());

  const { handleSubmit, register, watch } = useForm<ResetPasswordFormData>({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: {
      email: '',
    },
  });
  const email = watch('email').trim();

  const onSubmit = async () => {
    setIsSubmitting(true);
    // clear error messages
    setErrorMessage('');

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

  const signInLink = (
    <Link
      to={signInHref}
      state={{ prefillEmail: email && isEmailValid(email) ? email : undefined }}
      className="link-blue"
      data-glean-id="reset_password_signin_alternatives_link"
    >
      Try signing in with Google, Apple, or a passkey instead.
    </Link>
  );
  const learnMoreLink = (
    <LinkExternal
      href={learnMoreUrl}
      className="link-blue"
      gleanDataAttrs={{ id: 'reset_password_data_recovery_learn_more_link' }}
    >
      Learn more
    </LinkExternal>
  );

  return (
    <AppLayout {...{ setCurrentSplitLayout }}>
      <FtlMsg id="password-reset-forgot-heading">
        <h1 className="card-header">Forgot your password?</h1>
      </FtlMsg>

      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}

      <FtlMsg id="password-reset-alternatives-body" elems={{ signInLink }}>
        <p className="mt-1 mb-6">
          {signInLink} Or enter your email and we’ll send you a code to reset
          your password.
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
            onChange={() => setErrorMessage('')}
            autoFocus
            autoComplete="username"
            spellCheck={false}
            registration={register('email')}
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

      <FtlMsg
        id="password-reset-data-recovery-warning"
        elems={{ learnMoreLink }}
      >
        <p className="text-xs text-grey-500">
          Resetting your password may affect whether you can recover synced
          browser data. {learnMoreLink}
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export default ResetPassword;
