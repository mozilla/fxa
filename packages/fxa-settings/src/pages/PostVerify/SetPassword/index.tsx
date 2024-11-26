/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { FormSetupAccount } from '../../../components/FormSetupAccount';
import { SetPasswordFormData, SetPasswordProps } from './interfaces';
import { useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { useFtlMsgResolver } from '../../../models';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import Banner from '../../../components/Banner';

export const SetPassword = ({
  email,
  createPasswordHandler,
  offeredSyncEngineConfigs,
  setDeclinedSyncEngines,
}: SetPasswordProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [createPasswordLoading, setCreatePasswordLoading] =
    useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');

  const onSubmit = useCallback(
    async ({ newPassword }: SetPasswordFormData) => {
      setCreatePasswordLoading(true);
      setBannerErrorText('');

      const { error } = await createPasswordHandler(newPassword);

      if (error) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        setBannerErrorText(localizedErrorMessage);
        // if the request errored, loading state must be marked as false to reenable submission
        setCreatePasswordLoading(false);
        return;
      }
    },
    [createPasswordHandler, ftlMsgResolver]
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
        <h1 className="card-header">Create password</h1>
      </FtlMsg>
      <p className="break-all mt-2">{email}</p>

      {bannerErrorText && (
        <Banner type="error" content={{ localizedHeading: bannerErrorText }} />
      )}

      <FtlMsg id="set-password-info">
        <p className="text-sm mt-6 mb-5">
          Your sync data is encrypted with your password to protect your
          privacy.
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
        loading={createPasswordLoading}
        onSubmit={handleSubmit(onSubmit)}
        // This page is only shown during the Sync flow
        isSync={true}
        isDesktopRelay={false}
        submitButtonGleanId='third-party-auth-set-password-submit'
      />
    </AppLayout>
  );
};

export default SetPassword;
