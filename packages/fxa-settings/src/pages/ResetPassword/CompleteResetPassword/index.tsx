/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import GleanMetrics from '../../../lib/glean';

import AppLayout from '../../../components/AppLayout';
import Banner, { BannerType } from '../../../components/Banner';
import FormPasswordWithInlineCriteria from '../../../components/FormPasswordWithInlineCriteria';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import { ReactComponent as BangIcon } from './icon-bang.svg';

import {
  CompleteResetPasswordFormData,
  CompleteResetPasswordProps,
} from './interfaces';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Link, useLocation } from '@reach/router';
import ResetPasswordWarning from '../../../components/ResetPasswordWarning';

const CompleteResetPassword = ({
  email,
  errorMessage,
  hasConfirmedRecoveryKey,
  locationState,
  submitNewPassword,
  estimatedSyncDeviceCount,
  recoveryKeyExists,
}: CompleteResetPasswordProps) => {
  const location = useLocation();

  useEffect(() => {
    hasConfirmedRecoveryKey
      ? GleanMetrics.passwordReset.recoveryKeyCreatePasswordView()
      : GleanMetrics.passwordReset.createNewView();
  }, [hasConfirmedRecoveryKey]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSyncDevices =
    estimatedSyncDeviceCount !== undefined && estimatedSyncDeviceCount > 0;

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
        <p className="text-start text-grey-400 text-sm mb-6">
          Reset your password
        </p>
      </FtlMsg>

      {/*
        In the event of serious error. A bright red banner will be displayed indicating
        the problem.
      */}
      {errorMessage && <Banner type={BannerType.error}>{errorMessage}</Banner>}

      {/*
        Inline message to help the user understand the status and ramifications
        of their password reset. ie Will their data persist, or is an way to
        recover it.
      */}
      {hasConfirmedRecoveryKey === false && recoveryKeyExists === undefined && (
        <div
          className="flex bg-red-50 rounded-sm text-xs text-start p-3"
          data-testid="warning-message-container"
        >
          <BangIcon role="img" className="flex-initial me-2 mt-1" />
          <div className="flex-1">
            <FtlMsg id="password-reset-could-not-determine-account-recovery-key">
              <p>Got your account recovery key?</p>
            </FtlMsg>
            <FtlMsg id="password-reset-use-account-recovery-key">
              <Link
                to={`/account_recovery_confirm_key${location.search}`}
                state={locationState}
                className="link-blue"
                onClick={() =>
                  GleanMetrics.passwordReset.createNewRecoveryKeyMessageClick()
                }
              >
                Reset your password and keep your data
              </Link>
            </FtlMsg>
          </div>
        </div>
      )}

      {hasConfirmedRecoveryKey === false &&
        recoveryKeyExists !== undefined &&
        hasSyncDevices && <ResetPasswordWarning />}
      {/*
        Hidden email field is to allow Fx password manager
        to correctly save the updated password. Without it,
        the password manager tries to save the old password
        as the username.
      */}
      <input type="email" value={email} className="hidden" readOnly />

      <FtlMsg id="complete-reset-pw-header-v2">
        <h1 className="font-semibold text-xl text-start mt-6">
          Create a new password
        </h1>
      </FtlMsg>
      <section className="text-start mt-2">
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
      <LinkRememberPassword email={email} />
    </AppLayout>
  );
};

export default CompleteResetPassword;
