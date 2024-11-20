/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import SetPassword from '.';
import { currentAccount } from '../../../lib/cache';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import {
  isOAuthNativeIntegration,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';
import { cache } from '../../../lib/cache';
import { useState } from 'react';
import { CreatePasswordHandler, SetPasswordIntegration } from './interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import {
  AUTH_DATA_KEY,
  SensitiveDataClientAuthKeys,
} from '../../../lib/sensitive-data-client';
import useSyncEngines from '../../../lib/hooks/useSyncEngines';
import { getSyncNavigate } from '../../Signin/utils';
import firefox from '../../../lib/channels/firefox';

const SetPasswordContainer = ({
  integration,
}: { integration: SetPasswordIntegration } & RouteComponentProps) => {
  const navigate = useNavigate();
  const authClient = useAuthClient();
  const storedLocalAccount = currentAccount();
  const email = storedLocalAccount?.email;
  const sessionToken = storedLocalAccount?.sessionToken;
  const uid = storedLocalAccount?.uid;

  const sensitiveDataClient = useSensitiveDataClient();
  const sensitiveData = sensitiveDataClient.getData(AUTH_DATA_KEY);
  const { keyFetchToken, unwrapBKey } =
    (sensitiveData as SensitiveDataClientAuthKeys) || {};

  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const [createPasswordLoading, setCreatePasswordLoading] =
    useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');
  const {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    setDeclinedSyncEngines,
    // TODO some metrics on this page?
  } = useSyncEngines(integration);
  const isOAuthNative = isOAuthNativeIntegration(integration);

  // Users must be already authenticated on this page. This page is currently always
  // for the Sync flow so keys are always required.
  if (
    !email ||
    !sessionToken ||
    !uid ||
    !keyFetchToken ||
    !unwrapBKey ||
    !integration.isSync()
  ) {
    navigate('/signin', { replace: true });
    return <LoadingSpinner />;
  }

  const createPasswordHandler: CreatePasswordHandler = async (newPassword) => {
    try {
      const passwordCreated = await authClient.createPassword(
        sessionToken,
        email,
        newPassword
      );
      cache.modify({
        id: cache.identify({ __typename: 'Account' }),
        fields: {
          passwordCreated() {
            return passwordCreated;
          },
        },
      });

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
    } catch (error) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setBannerErrorText(localizedErrorMessage);
      // if the request errored, loading state must be marked as false to reenable submission
      setCreatePasswordLoading(false);
    }
  };

  return (
    <SetPassword
      {...{
        email,
        createPasswordHandler,
        setCreatePasswordLoading,
        createPasswordLoading,
        bannerErrorText,
        offeredSyncEngineConfigs,
        setDeclinedSyncEngines,
      }}
    />
  );
};

export default SetPasswordContainer;
