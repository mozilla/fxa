/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import GleanMetrics from '../../../lib/glean';

import AppLayout from '../../../components/AppLayout';
import FormPasswordWithInlineCriteria from '../../../components/FormPasswordWithInlineCriteria';
import LinkRememberPassword from '../../../components/LinkRememberPassword';

import {
  CompleteResetPasswordFormData,
  CompleteResetPasswordProps,
} from './interfaces';
import { FtlMsg } from 'fxa-react/lib/utils';
import ResetPasswordWarning from '../../../components/ResetPasswordWarning';
import { Link, useLocation } from '@reach/router';
import Banner from '../../../components/Banner';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import { useFtlMsgResolver } from '../../../models';

const CompleteResetPassword = ({
  email,
  errorMessage,
  hasConfirmedRecoveryKey,
  locationState,
  submitNewPassword,
  estimatedSyncDeviceCount,
  recoveryKeyExists,
  integrationIsSync,
  isFirefoxClientServiceRelay,
}: CompleteResetPasswordProps) => {
  const location = useLocation();
  const searchParams = location.search;
  useEffect(() => {
    hasConfirmedRecoveryKey
      ? GleanMetrics.passwordReset.recoveryKeyCreatePasswordView()
      : GleanMetrics.passwordReset.createNewView();
  }, [hasConfirmedRecoveryKey]);

  const ftlMsgResolver = useFtlMsgResolver();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSyncUser = !!(
    integrationIsSync ||
    (estimatedSyncDeviceCount !== undefined && estimatedSyncDeviceCount > 0)
  );
  const showSyncWarning = !!(!hasConfirmedRecoveryKey && isSyncUser);

  const showRecoveryKeyLink = !!(recoveryKeyExists && !hasConfirmedRecoveryKey);

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<CompleteResetPasswordFormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });

  const onSubmit = async () => {
    setIsSubmitting(true);
    await submitNewPassword(getValues('newPassword'));
    setIsSubmitting(false);
  };

  return (
    <AppLayout>
      <FtlMsg id="password-reset-flow-heading">
        <HeadingPrimary>Reset your password</HeadingPrimary>
      </FtlMsg>

      {/*
        In the event of serious error. A bright red banner will be displayed indicating
        the problem.
      */}
      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}

      {/* Show an error message to sync users who do not have or have not used a recovery key */}
      {showSyncWarning && (
        <ResetPasswordWarning {...{ locationState, searchParams }} />
      )}

      {/*
        Hidden email field is to allow Fx password manager
        to correctly save the updated password. Without it,
        the password manager tries to save the old password
        as the username.
      */}
      <input type="email" value={email} className="hidden" readOnly />

      {isFirefoxClientServiceRelay && (
        <Banner
          type="info"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'complete-reset-password-desktop-relay',
              'Firefox will try sending you back to use an email mask after you sign in.'
            ),
          }}
        />
      )}

      <FtlMsg id="complete-reset-pw-header-v2">
        <h2 className="font-semibold text-xl mt-6">Create a new password</h2>
      </FtlMsg>

      <section className="mt-2">
        <FormPasswordWithInlineCriteria
          {...{
            email,
            errors,
            formState,
            getValues,
            register,
            trigger,
          }}
          passwordFormType="reset"
          onSubmit={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </section>
      <div className="flex flex-col mt-6 gap-4">
        <LinkRememberPassword {...{ email }} />
        {showRecoveryKeyLink && (
          <FtlMsg id="complete-reset-pw-recovery-key-link">
            <Link
              to={`/account_recovery_confirm_key${location.search}`}
              state={locationState}
              className="link-blue text-sm"
              data-glean-id="complete_reset_password_recovery_key_link"
            >
              Use account recovery key
            </Link>
          </FtlMsg>
        )}
      </div>
    </AppLayout>
  );
};

export default CompleteResetPassword;
