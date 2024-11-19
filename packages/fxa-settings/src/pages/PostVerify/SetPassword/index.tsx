/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { FormSetupAccount } from '../../../components/FormSetupAccount';
import { SetPasswordFormData, SetPasswordProps } from './interfaces';
import { useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import firefox from '../../../lib/channels/firefox';
import { isOAuthNativeIntegration, useFtlMsgResolver } from '../../../models';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import Banner from '../../../components/Banner';
import { useLocation, useNavigate } from '@reach/router';
import { getSyncNavigate } from '../../Signin/utils';
import useSyncEngines from '../../../lib/hooks/useSyncEngines';

export const SetPassword = ({
  email,
  sessionToken,
  uid,
  createPasswordHandler,
  keyFetchToken,
  unwrapBKey,
  integration,
}: SetPasswordProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const navigate = useNavigate();
  const [createPasswordLoading, setCreatePasswordLoading] =
    useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');
  const {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    setDeclinedSyncEngines,
    // TODO some metrics on this page?
    selectedEngines,
  } = useSyncEngines(integration);
  const isOAuthNative = isOAuthNativeIntegration(integration);

  const onSubmit = useCallback(
    async ({ newPassword }: SetPasswordFormData) => {
      setCreatePasswordLoading(true);

      const { error } = await createPasswordHandler(
        email,
        sessionToken,
        newPassword
      );

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

      const syncEngines = {
        offeredEngines: offeredSyncEngines,
        declinedEngines: declinedSyncEngines,
      };

      // GleanMetrics.registration.cwts({ sync: { cwts: syncOptions } });
      firefox.fxaLogin({
        email,
        // Do not send these values if OAuth. Mobile doesn't care about this message, and
        // sending these values can cause intermittent sync disconnect issues in oauth desktop.
        ...(!isOAuthNative && {
          keyFetchToken,
          unwrapBKey,
        }),
        sessionToken,
        uid,
        verified: true,
        services: {
          sync: syncEngines,
        },
      });

      // TODO: call finishOAuthFlowHandler here or needs reauth?
      // if (
      //   isOAuthNative &&
      //   oauthData
      // ) {
      //   firefox.fxaOAuthLogin({
      //     action: 'signin',
      //     code: oauthData.code,
      //     redirect: oauthData.redirect,
      //     state: oauthData.state,
      //   });
      // }

      // navigate to inline recovery key setup
      const { to } = getSyncNavigate(location.search, true);
      navigate(to, {
        state: {
          email,
          uid,
          sessionToken,
        },
      });
    },
    [
      createPasswordHandler,
      email,
      ftlMsgResolver,
      isOAuthNative,
      keyFetchToken,
      location.search,
      navigate,
      sessionToken,
      uid,
      unwrapBKey,
      declinedSyncEngines,
      offeredSyncEngines,
    ]
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
