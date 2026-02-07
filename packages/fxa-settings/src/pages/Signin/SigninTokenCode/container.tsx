/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import SigninTokenCode from '.';
import AppLayout from '../../../components/AppLayout';
import {
  Integration,
  isOAuthNativeIntegration,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
import OAuthDataError from '../../../components/OAuthDataError';
import { useEffect, useState } from 'react';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { tryFinalizeUpgrade } from '../../../lib/auth-key-stretch-upgrade';
import { useOAuthFlowRecovery } from '../../../lib/hooks/useOAuthFlowRecovery';

// The email with token code (verifyLoginCodeEmail) is sent on `/signin`
// submission if conditions are met.

const SigninTokenCodeContainer = ({
  integration,
  setCurrentSplitLayout,
}: {
  integration: Integration;
  setCurrentSplitLayout?: (value: boolean) => void;
} & RouteComponentProps) => {
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninLocationState;
  };

  const signinState = getSigninState(location.state);
  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  // Hook to recover OAuth flow after page refresh or browser crash
  const { isRecovering, recoveryFailed, attemptOAuthFlowRecovery } =
    useOAuthFlowRecovery(integration);

  const [totpVerified, setTotpVerified] = useState<boolean>(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState<boolean>(false);

  // Attempt OAuth flow recovery for Sync when state is missing or keys are lost
  useEffect(() => {
    const shouldAttemptRecovery =
      !recoveryAttempted &&
      isOAuthNativeIntegration(integration) &&
      (!signinState || !signinState.sessionToken || oAuthKeysCheckError);

    if (shouldAttemptRecovery) {
      setRecoveryAttempted(true);
      attemptOAuthFlowRecovery();
    }
  }, [
    recoveryAttempted,
    integration,
    signinState,
    oAuthKeysCheckError,
    attemptOAuthFlowRecovery,
  ]);

  // Handle recovery failure - navigate to signin with error message
  useEffect(() => {
    if (recoveryFailed) {
      const localizedErrorMessage = ftlMsgResolver.getMsg(
        'signin-recovery-error',
        'Something went wrong. Please sign in again.'
      );
      navigateWithQuery('/signin', {
        state: { localizedErrorMessage },
      });
    }
  }, [recoveryFailed, ftlMsgResolver, navigateWithQuery]);

  useEffect(() => {
    if (!signinState || !signinState.sessionToken) {
      // case handled after the useEffect
      return;
    }
    const getTotpStatus = async () => {
      // We only care about "verified" here, not "exists"
      // because "exists" only tells us that totp setup was started.
      // Prior to using Redis during setup, tokens were directly stored in the database,
      // but may never be marked as enabled/verified if setup is aborted or unsuccessful.
      const { verified } = await authClient.checkTotpTokenExists(
        signinState.sessionToken
      );
      setTotpVerified(verified);
    };
    getTotpStatus();
  }, [authClient, signinState]);

  const cmsInfo = integration.getCmsInfo();
  const splitLayout = cmsInfo?.SigninTokenCodePage?.splitLayout;

  // Show loading while attempting OAuth flow recovery
  if (isRecovering) {
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  if (!signinState || !signinState.sessionToken) {
    // For non-OAuth Native flows, navigate to root
    // For OAuth Native flows, recovery was already attempted above
    if (!isOAuthNativeIntegration(integration)) {
      navigateWithQuery('/');
    }
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  // redirect if there is 2FA is set up for the account,
  // but the session is not TOTP verified
  if (totpVerified) {
    navigateWithQuery('/signin_totp_code', {
      state: signinState,
    });
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }
  // For OAuth Native, recovery should have been attempted; for others, show error
  if (oAuthKeysCheckError && !isOAuthNativeIntegration(integration)) {
    return <OAuthDataError error={oAuthKeysCheckError} />;
  }

  const onSessionVerified = async (sessionId: string) => {
    // This will attempt to complete any blocked key stretching upgrades
    await tryFinalizeUpgrade(
      sessionId,
      sensitiveDataClient,
      'signin-token-code',
      authClient
    );
  };

  return (
    <SigninTokenCode
      {...{
        finishOAuthFlowHandler,
        integration,
        signinState,
        keyFetchToken,
        unwrapBKey,
        onSessionVerified,
        setCurrentSplitLayout,
      }}
    />
  );
};

export default SigninTokenCodeContainer;
