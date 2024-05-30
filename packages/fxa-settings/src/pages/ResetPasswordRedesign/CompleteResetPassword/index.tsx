/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import GleanMetrics from '../../../lib/glean';

import AppLayout from '../../../components/AppLayout';
import Banner, { BannerType } from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import FormPasswordWithBalloons from '../../../components/FormPasswordWithBalloons';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import WarningMessage from '../../../components/WarningMessage';

import {
  CompleteResetPasswordFormData,
  CompleteResetPasswordProps,
} from './interfaces';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Link, useLocation } from '@reach/router';

const CompleteResetPassword = ({
  email,
  errorMessage,
  hasConfirmedRecoveryKey,
  locationState,
  submitNewPassword,
}: CompleteResetPasswordProps) => {
  const location = useLocation();

  useEffect(() => {
    hasConfirmedRecoveryKey
      ? GleanMetrics.resetPassword.recoveryKeyCreatePasswordView()
      : GleanMetrics.resetPassword.createNewView();
  }, [hasConfirmedRecoveryKey]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <CardHeader
        headingText="Create new password"
        headingTextFtlId="complete-reset-pw-header"
      />

      {!hasConfirmedRecoveryKey &&
        locationState.recoveryKeyExists === undefined && (
          <Banner type={BannerType.error}>
            <>
              <FtlMsg id="complete-reset-password-recovery-key-error-v2">
                <p>
                  Sorry, there was a problem checking if you have an account
                  recovery key.
                </p>
              </FtlMsg>
              {/* TODO add metrics to measure if users see and click on this link */}
              <FtlMsg id="complete-reset-password-recovery-key-link">
                <Link
                  to={`/account_recovery_confirm_key${location.search}`}
                  state={locationState}
                  className="link-white underline-offset-4"
                >
                  Reset your password with your account recovery key.
                </Link>
              </FtlMsg>
            </>
          </Banner>
        )}

      {errorMessage && <Banner type={BannerType.error}>{errorMessage}</Banner>}

      {hasConfirmedRecoveryKey ? (
        <FtlMsg id="account-restored-success-message">
          <p className="text-sm mb-4">
            You have successfully restored your account using your account
            recovery key. Create a new password to secure your data, and store
            it in a safe location.
          </p>
        </FtlMsg>
      ) : (
        <WarningMessage
          warningMessageFtlId="complete-reset-password-warning-message-2"
          warningType="Remember:"
        >
          When you reset your password, you reset your account. You may lose
          some of your personal information (including history, bookmarks, and
          passwords). That’s because we encrypt your data with your password to
          protect your privacy. You’ll still keep any subscriptions you may have
          and Pocket data will not be affected.
        </WarningMessage>
      )}

      {/* Hidden email field is to allow Fx password manager
          to correctly save the updated password. Without it,
          the password manager tries to save the old password
          as the username. */}
      <input type="email" value={email} className="hidden" readOnly />
      <section className="text-start mt-4">
        <FormPasswordWithBalloons
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
      <LinkRememberPassword email={email} />
    </AppLayout>
  );
};

export default CompleteResetPassword;
