/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { FormSetupAccount } from '../../../components/FormSetupAccount';
import { SetPasswordFormData, SetPasswordProps } from './interfaces';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { useFtlMsgResolver } from '../../../models';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import Banner from '../../../components/Banner';
import {
  getCmsHeadlineClassName,
  getCmsHeadlineStyle,
} from '../../../components/CardHeader';
import GleanMetrics from '../../../lib/glean';

export const SetPassword = ({
  email,
  createPasswordHandler,
  offeredSyncEngineConfigs,
  integration,
  isPasswordlessFlow = false,
}: SetPasswordProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [createPasswordLoading, setCreatePasswordLoading] =
    useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');

  const gleanReason = isPasswordlessFlow ? 'otp' : 'third_party_auth';

  useEffect(() => {
    GleanMetrics.thirdPartyAuthSetPassword.view({
      event: { reason: gleanReason },
    });
  }, [gleanReason]);

  const onSubmit = useCallback(
    async ({ newPassword }: SetPasswordFormData) => {
      GleanMetrics.thirdPartyAuthSetPassword.submit({
        event: { reason: gleanReason },
      });
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
    [createPasswordHandler, ftlMsgResolver, gleanReason]
  );

  const {
    handleSubmit,
    register,
    getValues,
    errors,
    formState,
    trigger,
    watch,
  } = useForm<SetPasswordFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      email,
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Fire engage on the first keystroke into the password field (not on focus
  // alone) so the event reflects actual user intent to type a password.
  // Matches the engage pattern used by SigninPasswordlessCode.
  const [hasEngaged, setHasEngaged] = useState(false);
  const newPasswordValue = watch('newPassword');
  useEffect(() => {
    if (hasEngaged === false && newPasswordValue) {
      setHasEngaged(true);
      GleanMetrics.thirdPartyAuthSetPassword.engage({
        event: { reason: gleanReason },
      });
    }
  }, [hasEngaged, newPasswordValue, gleanReason]);

  const cmsInfo = integration?.getCmsInfo?.();
  const cmsPage = cmsInfo?.PostVerifySetPasswordPage;
  const cmsHeadline = cmsPage?.headline;
  const cmsDescription = cmsPage?.description;
  const cmsButton = {
    color: cmsInfo?.shared.buttonColor,
    text: cmsPage?.primaryButtonText,
  };

  return (
    <AppLayout cmsInfo={cmsInfo} title={cmsPage?.pageTitle}>
      {cmsHeadline ? (
        <h1
          className={getCmsHeadlineClassName(cmsInfo?.shared.headlineFontSize)}
          style={getCmsHeadlineStyle(cmsInfo?.shared.headlineTextColor)}
        >
          {cmsHeadline}
        </h1>
      ) : (
        <FtlMsg id="set-password-heading-v2">
          <h1 className="card-header">Create password to sync</h1>
        </FtlMsg>
      )}
      <p className="break-all mt-2">{email}</p>

      {bannerErrorText && (
        <Banner type="error" content={{ localizedHeading: bannerErrorText }} />
      )}

      {isPasswordlessFlow ? (
        <FtlMsg id="set-password-passwordless-info">
          <p className="text-sm mt-6 mb-5">
            This password encrypts your synced data and keeps it secure.
          </p>
        </FtlMsg>
      ) : cmsDescription ? (
        <p className="text-sm mt-6 mb-5">{cmsDescription}</p>
      ) : (
        <FtlMsg id="set-password-info-v2">
          <p className="text-sm mt-6 mb-5">
            This encrypts your data. It needs to be different from your Google
            or Apple account password.
          </p>
        </FtlMsg>
      )}

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
        }}
        loading={createPasswordLoading}
        onSubmit={handleSubmit(onSubmit)}
        // This page is only shown during the Sync flow
        isSync={true}
        passwordFormType="post-verify-set-password"
        cmsButton={cmsButton}
      />
    </AppLayout>
  );
};

export default SetPassword;
