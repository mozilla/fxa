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
import { ReactComponent as WarnIcon } from './icon-warn.svg';
import { ReactComponent as IconNonSyncDevice } from './icon-non-sync-device.svg';
import { ReactComponent as IconSyncDevice } from './icon-sync-device.svg';

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
      <p className="text-start text-grey-400 text-sm">
        <FtlMsg id="password-reset-flow-heading">Reset your password</FtlMsg>
      </p>

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
      {hasConfirmedRecoveryKey === false &&
        recoveryKeyExists &&
        hasSyncDevices && (
          <div
            className={`bg-red-100 rounded-lg text-sm mt-6 text-left rtl:text-right p-3`}
            data-testid="warning-message-container"
          >
            <div className="flex">
              <BangIcon
                role="img"
                className="flex-initial mr-2 rtl:ml-2 mt-1"
              />
              <div className="flex-1 text-xs">
                <FtlMsg id="password-reset-could-not-determine-account-recovery-key">
                  Have an account recovery key?
                </FtlMsg>{' '}
                <br />
                <Link
                  to={`/account_recovery_confirm_key${location.search}`}
                  state={locationState}
                  className="link-blue"
                  onClick={() =>
                    GleanMetrics.passwordReset.createNewRecoveryKeyMessageClick()
                  }
                >
                  <FtlMsg id="password-reset-use-account-recovery-key">
                    Reset your password with your recovery key.
                  </FtlMsg>
                </Link>{' '}
              </div>
            </div>
          </div>
        )}

      {hasConfirmedRecoveryKey === false &&
        recoveryKeyExists === false &&
        hasSyncDevices && (
          <div
            className={`bg-orange-50 rounded-lg text-sm mt-6 text-left rtl:text-right p-3`}
            data-testid="warning-message-container"
          >
            <div className="flex font-semibold">
              <WarnIcon
                role="img"
                className="flex-initial mr-2 rtl:ml-2 mt-1"
              />
              <h1 className="flex-1">
                <FtlMsg id="password-reset-data-may-not-be-recovered">
                  Resetting your password may delete your encrypted browser
                  data.
                </FtlMsg>
              </h1>
            </div>
            <div className="ps-4 pb-6">
              <p className="font-semibold pt-4">
                <IconSyncDevice role="img" className="inline-block mr-2" />
                <FtlMsg id="password-reset-previously-signed-in-device">
                  Have a device where you previously signed in?
                </FtlMsg>
              </p>
              <p className="ps-6 text-xs">
                <FtlMsg id="password-reset-data-maybe-saved-locally">
                  Your browser data may be locally saved on that device. Sign in
                  there with your new password to restore and sync.
                </FtlMsg>
              </p>
              <p className="font-semibold pt-4">
                <IconNonSyncDevice role="img" className="inline-block mr-2" />
                <FtlMsg id="password-reset-no-old-device">
                  Have a new device but don’t have your old one?
                </FtlMsg>
              </p>
              <p className="ps-6 text-xs">
                <FtlMsg id="password-reset-encrypted-data-cannot-be-recovered">
                  We’re sorry, but your encrypted browser data on Firefox
                  servers can’t be recovered.
                </FtlMsg>
              </p>
              <p className="ps-6 text-xs mt-4">
                <a
                  href="https://support.mozilla.org/en-US/kb/reset-your-firefox-account-password-recovery-keys"
                  className="link-blue"
                >
                  <FtlMsg id="password-reset-learn-about-restoring-account-data">
                    Learn more about restoring account data.
                  </FtlMsg>
                </a>
              </p>
            </div>
          </div>
        )}
      {/*
        Hidden email field is to allow Fx password manager
        to correctly save the updated password. Without it,
        the password manager tries to save the old password
        as the username.
      */}
      <input type="email" value={email} className="hidden" readOnly />

      <h1 className="font-semibold text-xl text-left rtl:text-right mt-6">
        <FtlMsg id="complete-reset-pw-header-v2">Create a new password</FtlMsg>
      </h1>
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
