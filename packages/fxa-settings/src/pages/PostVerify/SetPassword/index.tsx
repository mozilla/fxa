/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { FormSetupAccount } from '../../../components/FormSetupAccount';
import { SetPasswordFormData, SetPasswordProps } from './interfaces';
import { useForm } from 'react-hook-form';
import { useCallback } from 'react';
import Banner from '../../../components/Banner';

export const SetPassword = ({
  bannerErrorText,
  email,
  createPasswordHandler,
  setCreatePasswordLoading,
  createPasswordLoading,
  offeredSyncEngineConfigs,
  setDeclinedSyncEngines,
}: SetPasswordProps) => {
  
  const onSubmit = useCallback(
    async ({ newPassword }: SetPasswordFormData) => {
      setCreatePasswordLoading(true);
      await createPasswordHandler(newPassword);
    },
    [createPasswordHandler, setCreatePasswordLoading]
  );

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<SetPasswordFormData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        email,
        newPassword: '',
        confirmPassword: '',
      },
    });

  return (
    <AppLayout>
      <FtlMsg id="set-password-heading">
        <h1 className="card-header">Set your password</h1>
      </FtlMsg>
      <p className="break-all mt-2">${email}</p>

      {bannerErrorText && (
        <Banner type="error" content={{ localizedHeading: bannerErrorText }} />
      )}

      <FtlMsg id="set-password-info">
        <p className="text-base">
          Please create a password to continue to Firefox Sync. Your data is
          encrypted with your password to protect your privacy.
        </p>
      </FtlMsg>

      <FormSetupAccount
        {...{
          formState,
          errors,
          trigger,
          register,
          getValues,
          email,
          handleSubmit,
          offeredSyncEngineConfigs,
          setDeclinedSyncEngines,
        }}
        onFocusMetricsEvent={() => {
          /* TODO */
        }}
        onFocus={() => {
          /* TODO */
        }}
        loading={createPasswordLoading}
        onSubmit={handleSubmit(onSubmit)}
        // This page is only shown during the Sync flow
        isSync={true}
        isDesktopRelay={false}
      />
    </AppLayout>
  );
};

export default SetPassword;
