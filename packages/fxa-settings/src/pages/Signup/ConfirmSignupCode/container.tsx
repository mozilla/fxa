/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState, useRef } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { currentAccount } from '../../../lib/cache';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import {
  Integration,
  isOAuthNativeIntegration,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';
import ConfirmSignupCode from '.';
import { LocationState } from './interfaces';
import OAuthDataError from '../../../components/OAuthDataError';
import { QueryParams } from '../../..';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import GleanMetrics from '../../../lib/glean';
import AppLayout from '../../../components/AppLayout';
import { useOAuthFlowRecovery } from '../../../lib/hooks/useOAuthFlowRecovery';

export const POLL_INTERVAL = 5000;

function getAccountInfo(
  emailFromLocationState?: string,
  sessionTokenFromLocationState?: string,
  uidFromLocationState?: string
) {
  let email = emailFromLocationState;
  let sessionToken = sessionTokenFromLocationState;
  let uid = uidFromLocationState;
  // only read from local storage if email isn't provided via router state
  if (!email || !sessionToken || !uid) {
    const storedLocalAccount = currentAccount();
    email = storedLocalAccount?.email;
    sessionToken = storedLocalAccount?.sessionToken;
    uid = storedLocalAccount?.uid;
  }
  return { email, sessionToken, uid };
}

const SignupConfirmCodeContainer = ({
  integration,
  flowQueryParams,
  setCurrentSplitLayout,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
  setCurrentSplitLayout?: (value: boolean) => void;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const sensitiveDataClient = useSensitiveDataClient();
  const ftlMsg = useFtlMsgResolver();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  // Hook to recover OAuth flow after page refresh or browser crash
  const { isRecovering, recoveryFailed, attemptOAuthFlowRecovery } =
    useOAuthFlowRecovery(integration);

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const {
    origin,
    selectedNewsletterSlugs: newsletterSlugs,
    offeredSyncEngines,
    declinedSyncEngines,
    sessionToken: sessionTokenFromLocationState,
    email: emailFromLocationState,
    uid: uidFromLocationState,
  } = location.state || {};
  const navigateWithQuery = useNavigateWithQuery();

  // If a user tries to signin and they haven't verified their account yet, we pass
  // this state through router state and redirect here. Otherwise, we read from localStorage.
  const { email, sessionToken, uid } = getAccountInfo(
    emailFromLocationState,
    sessionTokenFromLocationState,
    uidFromLocationState
  );

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  console.log('From confirm container', integration)

  // Poll for hard bounces registered in database for the entered email.
  // Previously, we checked if the account was deleted, and assumed
  // that implied the email bounced/was invalid.
  const [hasHardBounce, setHasHardBounce] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkEmailBounceStatus = async () => {
      if (!email) return;
      try {
        // Type assertion needed until fxa-auth-client is rebuilt with new method
        const result = await (
          authClient as typeof authClient & {
            emailBounceStatus: (
              email: string
            ) => Promise<{ hasHardBounce: boolean }>;
          }
        ).emailBounceStatus(email);
        if (result.hasHardBounce) {
          setHasHardBounce(true);
        }
      } catch (error) {
        // Silently fail - we don't want to block the user flow on errors
        console.error('Error checking email bounce status:', error);
      }
    };

    // Initial check
    checkEmailBounceStatus();

    // Set up polling
    pollIntervalRef.current = setInterval(
      checkEmailBounceStatus,
      POLL_INTERVAL
    );

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [authClient, email]);

  const [recoveryAttempted, setRecoveryAttempted] = useState<boolean>(false);

  // Attempt OAuth flow recovery for Firefox/Sync when state is missing or keys are lost
  useEffect(() => {
    const shouldAttemptRecovery =
      !recoveryAttempted &&
      isOAuthNativeIntegration(integration) &&
      (!uid || !sessionToken || !email || oAuthKeysCheckError);

    if (shouldAttemptRecovery) {
      setRecoveryAttempted(true);
      attemptOAuthFlowRecovery();
    }
  }, [
    recoveryAttempted,
    integration,
    uid,
    sessionToken,
    email,
    oAuthKeysCheckError,
    attemptOAuthFlowRecovery,
  ]);

  // Handle recovery failure - navigate to signin with error message
  useEffect(() => {
    if (recoveryFailed) {
      const localizedErrorMessage = ftlMsg.getMsg(
        'signin-recovery-error',
        'Something went wrong. Please sign in again.'
      );
      navigateWithQuery('/signin', {
        state: { localizedErrorMessage },
      });
    }
  }, [recoveryFailed, ftlMsg, navigateWithQuery]);

  // Handle email bounces
  useEffect(() => {
    if (hasHardBounce) {
      const hasBounced = true;
      // if arriving from signup, return to '/' and allow user to signup with another email
      if (origin === 'signup') {
        navigateWithQuery('/', {
          state: {
            hasBounced,
            prefillEmail: email,
          },
        });
      } else {
        // if not arriving from signup, redirect to signin_bounced for support info
        navigateWithQuery('/signin_bounced');
      }
    }
  }, [hasHardBounce, origin, navigateWithQuery, email]);

  const cmsInfo = integration?.getCmsInfo();
  const splitLayout = cmsInfo?.SignupConfirmCodePage?.splitLayout;

  // TODO: This check and related test can be moved up the tree to the App component,
  // where a missing integration should be caught and handled.
  if (!integration) {
    return (
      <AppLayout {...{ loading: true, splitLayout, setCurrentSplitLayout }} />
    );
  }

  // Show loading while attempting OAuth flow recovery
  if (isRecovering) {
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  if (!uid || !sessionToken || !email) {
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

  if (oAuthDataError) {
    return (
      <OAuthDataError
        error={oAuthDataError}
        gleanMetric={GleanMetrics.signupConfirmation.error}
      />
    );
  }
  if (oAuthKeysCheckError) {
    // For OAuth Native flows, recovery was already attempted above
    if (isOAuthNativeIntegration(integration)) {
      // Recovery should have redirected; show loading while that happens
      return (
        <AppLayout
          {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
        />
      );
    }
    if (!keyFetchToken || !unwrapBKey) {
      const localizedErrorMessage = ftlMsg.getMsg(
        'signin-code-expired-error',
        'Code expired. Please sign in again.'
      );
      navigateWithQuery('/signin', {
        state: {
          localizedErrorMessage,
        },
      });
      return (
        <AppLayout
          {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
        />
      );
    }
    return (
      <OAuthDataError
        error={oAuthKeysCheckError}
        gleanMetric={GleanMetrics.signupConfirmation.error}
      />
    );
  }

  return (
    <ConfirmSignupCode
      {...{
        uid,
        email,
        sessionToken,
        integration,
        finishOAuthFlowHandler,
        newsletterSlugs,
        offeredSyncEngines,
        declinedSyncEngines,
        keyFetchToken,
        unwrapBKey,
        flowQueryParams,
        origin,
        setCurrentSplitLayout,
      }}
    />
  );
};
export default SignupConfirmCodeContainer;
